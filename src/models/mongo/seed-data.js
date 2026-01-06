import bcrypt from "bcrypt";

const hashedPassword = bcrypt.hashSync("1", 10);

const monthsAgo = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const seedData = {
  users: {
    _model: "User",
    moritz: {
      firstName: "Moritz",
      lastName: "Hutzler",
      email: "moritz@diehutzlers.de",
      password: hashedPassword,
      isAdmin: true,
    },
    jannis: {
      firstName: "Jannis",
      lastName: "Hutzler",
      email: "jannis@diehutzlers.de",
      password: hashedPassword,
    },
  },
  placemarks: {
    _model: "Placemark",
    // Sightseeing
    steinerneBruecke: {
      title: "Stone Bridge",
      category: "Sightseeing",
      description: "Medieval stone bridge from the 12th century, UNESCO World Heritage Site",
      latitude: 49.0225,
      longitude: 12.0969,
      userid: "->users.moritz",
      images: [
        "https://images.unsplash.com/photo-1666293438241-9f9b3654f118?w=800",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800"
      ],
      createdAt: monthsAgo(6),
    },
    dom: {
      title: "Regensburg Cathedral",
      category: "Sightseeing",
      description: "Gothic cathedral of St. Peter, landmark of the city with impressive stained glass windows",
      latitude: 49.0192,
      longitude: 12.0975,
      userid: "->users.moritz",
      images: [
        "https://images.unsplash.com/photo-1659100826967-5616a3b1501e?w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800"
      ],
      createdAt: monthsAgo(6),
    },
    altesRathaus: {
      title: "Old Town Hall",
      category: "Sightseeing",
      description: "Historic town hall with Imperial Diet Museum, center of the Perpetual Diet",
      latitude: 49.0199,
      longitude: 12.0957,
      userid: "->users.moritz",
      images: [
        "https://tourismus.regensburg.de/fileadmin/user_upload/12_Headerbilder/Altes_Rathaus_Tourist_Info____R_RTG.JPG",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"
      ],
      createdAt: monthsAgo(5),
    },
    portaPraetoria: {
      title: "Porta Praetoria",
      category: "Sightseeing",
      description: "Roman city gate from 179 AD, one of the oldest buildings in Germany",
      latitude: 49.0215,
      longitude: 12.0995,
      userid: "->users.moritz",
      images: [], 
      createdAt: monthsAgo(5),
    },
    schlossThurnUndTaxis: {
      title: "Thurn and Taxis Palace",
      category: "Sightseeing",
      description: "Princely palace with magnificent interior and famous Christmas market",
      latitude: 49.0147,
      longitude: 12.0867,
      userid: "->users.moritz",
      images: [
        "https://lh3.googleusercontent.com/p/AF1QipM4veGo6ICvLTgMqGB_wGXnYMwP0eRuBsGGqS6g=w270-h312-n-k-no",
        "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"
      ],
      createdAt: monthsAgo(4),
    },
    keplerHouse: {
      title: "Kepler Memorial House",
      category: "Sightseeing",
      description: "Home of astronomer Johannes Kepler, now a museum",
      latitude: 49.0206,
      longitude: 12.0951,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800"
      ],
      createdAt: monthsAgo(4),
    },
    stadtamhof: {
      title: "Stadtamhof",
      category: "Sightseeing",
      description: "Historic district north of the Danube with picturesque alleys",
      latitude: 49.0245,
      longitude: 12.0940,
      userid: "->users.jannis",
      images: [], // Kein Bild - für Donut-Chart Demo
      createdAt: monthsAgo(3),
    },
    // Restaurants
    wurstkuchl: {
      title: "Historic Sausage Kitchen",
      category: "Restaurants",
      description: "World's oldest sausage kitchen, serving since 1146 right by the Danube",
      latitude: 49.0224,
      longitude: 12.0965,
      userid: "->users.moritz",
      images: [
        "https://images.unsplash.com/photo-1724078770616-2f8e19d75761?q=80&w=872&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"
      ],
      createdAt: monthsAgo(3),
    },
    leererBeutel: {
      title: "Leerer Beutel",
      category: "Restaurants",
      description: "Restaurant and art forum in a historic granary building",
      latitude: 49.0190,
      longitude: 12.1020,
      userid: "->users.moritz",
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"
      ],
      createdAt: monthsAgo(3),
    },
    dampfnudel: {
      title: "Dampfnudel Uli",
      category: "Restaurants",
      description: "Traditional Bavarian cuisine, famous for the best steamed dumplings in town",
      latitude: 49.0185,
      longitude: 12.0945,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800"
      ],
      createdAt: monthsAgo(2),
    },
    storstad: {
      title: "Storstad",
      category: "Restaurants",
      description: "2-star Michelin restaurant with Nordic cuisine",
      latitude: 49.0170,
      longitude: 12.0980,
      userid: "->users.moritz",
      images: [],
      createdAt: monthsAgo(2),
    },
    orphee: {
      title: "Orphée",
      category: "Restaurants",
      description: "French restaurant in a historic setting",
      latitude: 49.0195,
      longitude: 12.0930,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"
      ],
      createdAt: monthsAgo(2),
    },
    // Bars
    kneitinger: {
      title: "Kneitinger Keller",
      category: "Bars",
      description: "Traditional beer garden with house brewery and Bavarian cuisine",
      latitude: 49.0180,
      longitude: 12.0920,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"
      ],
      createdAt: monthsAgo(1),
    },
    spitalgarten: {
      title: "Spitalgarten",
      category: "Bars",
      description: "Idyllic beer garden right on the Danube with view of the Stone Bridge",
      latitude: 49.0230,
      longitude: 12.0945,
      userid: "->users.moritz",
      images: [
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"
      ],
      createdAt: monthsAgo(1),
    },
    alteLinde: {
      title: "Alte Linde",
      category: "Bars",
      description: "Cozy pub with large beer selection in the old town",
      latitude: 49.0188,
      longitude: 12.0960,
      userid: "->users.jannis",
      images: [], 
      createdAt: daysAgo(20),
    },
    hemingways: {
      title: "Hemingway's",
      category: "Bars",
      description: "Cocktail bar with Caribbean flair and over 200 rum varieties",
      latitude: 49.0178,
      longitude: 12.0935,
      userid: "->users.moritz",
      images: [
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800"
      ],
      createdAt: daysAgo(15),
    },
    // Clubs
    scala: {
      title: "Scala Club",
      category: "Clubs",
      description: "Popular nightclub in the heart of Regensburg with multiple floors",
      latitude: 49.0150,
      longitude: 12.0950,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800"
      ],
      createdAt: daysAgo(10),
    },
    lux: {
      title: "LUX - Young Church",
      category: "Clubs",
      description: "Cultural center and venue for concerts and parties",
      latitude: 49.0172,
      longitude: 12.0890,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"
      ],
      createdAt: daysAgo(7),
    },
    alteMaelzerei: {
      title: "Alte Mälzerei",
      category: "Clubs",
      description: "Cultural center in historic malthouse with concerts and club events",
      latitude: 49.0140,
      longitude: 12.1050,
      userid: "->users.moritz",
      images: [],
      createdAt: daysAgo(3),
    },
    banane: {
      title: "Banane",
      category: "Clubs",
      description: "Student club with affordable drinks and great atmosphere",
      latitude: 49.0165,
      longitude: 12.0925,
      userid: "->users.jannis",
      images: [
        "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800",
        "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"
      ],
      createdAt: daysAgo(1),
    },
  },
};
