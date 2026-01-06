import Boom from "@hapi/boom";
import Wreck from "@hapi/wreck";
import { db } from "../models/db.js";
import { createToken } from "./jwt-utils.js";

const API_URL = process.env.API_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const oauthApi = {
  githubInit: {
    auth: false,
    handler: async function (request, h) {
      try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        if (!clientId) {
          return Boom.serverUnavailable("GitHub OAuth not configured");
        }
        const redirectUri = `${API_URL}/api/auth/github/callback`;
        const scope = "user:email";
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
        return h.redirect(githubAuthUrl);
      } catch (err) {
        console.error("GitHub OAuth init error:", err);
        return Boom.serverUnavailable("OAuth initialization failed");
      }
    },
    tags: ["api"],
    description: "Initiate GitHub OAuth flow",
    notes: "Redirects to GitHub authorization page",
  },

  githubCallback: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { code, error } = request.query;

        if (error) {
          console.error("GitHub OAuth error:", error);
          return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        if (!code) {
          return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          return Boom.serverUnavailable("GitHub OAuth not configured");
        }

        // Exchange code for access token
        const tokenResponse = await Wreck.post("https://github.com/login/oauth/access_token", {
          payload: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const tokenData = JSON.parse(tokenResponse.payload.toString());

        if (tokenData.error) {
          console.error("GitHub token exchange error:", tokenData.error);
          return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const accessToken = tokenData.access_token;

        // Get user info from GitHub
        const userResponse = await Wreck.get("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "User-Agent": "discoverRegensburg",
          },
        });

        const githubUser = JSON.parse(userResponse.payload.toString());

        // Get user email (may require additional request)
        let email = githubUser.email;
        if (!email) {
          const emailResponse = await Wreck.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
              "User-Agent": "discoverRegensburg",
            },
          });
          const emails = JSON.parse(emailResponse.payload.toString());
          const primaryEmail = emails.find((e) => e.primary) || emails[0];
          email = primaryEmail?.email;
        }

        if (!email) {
          return h.redirect(`${FRONTEND_URL}/login?error=email_required`);
        }

        // Find or create user
        let user = await db.userStore.getUserByOAuthId("github", githubUser.id.toString());

        if (!user) {
          // Check if user exists by email (link OAuth to existing account)
          user = await db.userStore.getUserByEmail(email);
          if (user) {
            // Link OAuth account to existing user
            try {
              await db.userStore.updateUserById(user._id, {
                oauthProvider: "github",
                oauthId: githubUser.id.toString(),
              });
              // Re-fetch user to get updated data
              user = await db.userStore.getUserById(user._id);
            } catch (linkError) {
              console.error("Error linking OAuth account:", linkError);
              // Continue with existing user even if linking fails
            }
          } else {
            // Create new OAuth user
            const nameParts = (githubUser.name || githubUser.login || "").split(" ");
            const newUserData = {
              firstName: nameParts[0] || githubUser.login || "User",
              lastName: nameParts.slice(1).join(" ") || "",
              email: email,
              password: null, // OAuth users have no password
              oauthProvider: "github",
              oauthId: githubUser.id.toString(),
              isAdmin: false,
            };
            console.log("Creating new OAuth user with data:", { ...newUserData, email: newUserData.email });
            try {
              user = await db.userStore.addUser(newUserData);
            } catch (createError) {
              // If creation fails (e.g., duplicate email), try to fetch the existing user
              console.error("Error creating OAuth user, trying to fetch existing:", createError.message);
              user = await db.userStore.getUserByEmail(email);
              if (user) {
                // Try to link OAuth to the existing user
                try {
                  await db.userStore.updateUserById(user._id, {
                    oauthProvider: "github",
                    oauthId: githubUser.id.toString(),
                  });
                  user = await db.userStore.getUserById(user._id);
                } catch (retryLinkError) {
                  console.error("Error linking on retry:", retryLinkError);
                }
              }
            }
            if (!user) {
              console.error("Failed to create user. addUser returned null");
              return h.redirect(`${FRONTEND_URL}/login?error=user_creation_failed`);
            }
          }
        }

        if (!user) {
          console.error("User is null after all attempts");
          return h.redirect(`${FRONTEND_URL}/login?error=user_creation_failed`);
        }

        // Generate JWT token
        const token = createToken(user);

        // Redirect to frontend callback with token
        return h.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
      } catch (err) {
        console.error("GitHub OAuth callback error:", err);
        console.error("Error stack:", err.stack);
        return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      }
    },
    tags: ["api"],
    description: "GitHub OAuth callback handler",
    notes: "Handles GitHub OAuth callback and creates/links user account",
  },

  googleInit: {
    auth: false,
    handler: async function (request, h) {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
          return Boom.serverUnavailable("Google OAuth not configured");
        }
        const redirectUri = `${API_URL}/api/auth/google/callback`;
        const scope = "openid email profile";
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
        return h.redirect(googleAuthUrl);
      } catch (err) {
        console.error("Google OAuth init error:", err);
        return Boom.serverUnavailable("OAuth initialization failed");
      }
    },
    tags: ["api"],
    description: "Initiate Google OAuth flow",
    notes: "Redirects to Google authorization page",
  },

  googleCallback: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { code, error } = request.query;

        if (error) {
          console.error("Google OAuth error:", error);
          return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        if (!code) {
          return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          return Boom.serverUnavailable("Google OAuth not configured");
        }

        const redirectUri = `${API_URL}/api/auth/google/callback`;

        // Exchange code for access token
        const tokenResponse = await Wreck.post("https://oauth2.googleapis.com/token", {
          payload: new URLSearchParams({
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }).toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const tokenData = JSON.parse(tokenResponse.payload.toString());

        if (tokenData.error) {
          console.error("Google token exchange error:", tokenData.error);
          return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const accessToken = tokenData.access_token;

        // Get user info from Google
        const userResponse = await Wreck.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });

        const googleUser = JSON.parse(userResponse.payload.toString());

        if (!googleUser.email) {
          return h.redirect(`${FRONTEND_URL}/login?error=email_required`);
        }

        // Find or create user
        let user = await db.userStore.getUserByOAuthId("google", googleUser.id);

        if (!user) {
          // Check if user exists by email (link OAuth to existing account)
          user = await db.userStore.getUserByEmail(googleUser.email);
          if (user) {
            // Link OAuth account to existing user
            try {
              await db.userStore.updateUserById(user._id, {
                oauthProvider: "google",
                oauthId: googleUser.id,
              });
              // Re-fetch user to get updated data
              user = await db.userStore.getUserById(user._id);
            } catch (linkError) {
              console.error("Error linking OAuth account:", linkError);
              // Continue with existing user even if linking fails
            }
          } else {
            // Create new OAuth user
            const nameParts = (googleUser.name || "").split(" ");
            const newUserData = {
              firstName: nameParts[0] || googleUser.given_name || "User",
              lastName: nameParts.slice(1).join(" ") || googleUser.family_name || "",
              email: googleUser.email,
              password: null, // OAuth users have no password
              oauthProvider: "google",
              oauthId: googleUser.id,
              isAdmin: false,
            };
            console.log("Creating new OAuth user with data:", { ...newUserData, email: newUserData.email });
            try {
              user = await db.userStore.addUser(newUserData);
            } catch (createError) {
              // If creation fails (e.g., duplicate email), try to fetch the existing user
              console.error("Error creating OAuth user, trying to fetch existing:", createError.message);
              user = await db.userStore.getUserByEmail(googleUser.email);
              if (user) {
                // Try to link OAuth to the existing user
                try {
                  await db.userStore.updateUserById(user._id, {
                    oauthProvider: "google",
                    oauthId: googleUser.id,
                  });
                  user = await db.userStore.getUserById(user._id);
                } catch (retryLinkError) {
                  console.error("Error linking on retry:", retryLinkError);
                }
              }
            }
            if (!user) {
              console.error("Failed to create user. addUser returned null");
              return h.redirect(`${FRONTEND_URL}/login?error=user_creation_failed`);
            }
          }
        }

        if (!user) {
          console.error("User is null after all attempts");
          return h.redirect(`${FRONTEND_URL}/login?error=user_creation_failed`);
        }

        // Generate JWT token
        const token = createToken(user);

        // Redirect to frontend callback with token
        return h.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
      } catch (err) {
        console.error("Google OAuth callback error:", err);
        console.error("Error stack:", err.stack);
        return h.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      }
    },
    tags: ["api"],
    description: "Google OAuth callback handler",
    notes: "Handles Google OAuth callback and creates/links user account",
  },
};

