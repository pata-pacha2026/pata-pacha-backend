import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    nameZh: '北欧风宠物窝', nameEn: 'Nordic Pet Bed', nameEs: 'Cama Nordica para Mascotas', nameFr: 'Lit Nordique pour Animaux', nameDe: 'Nordisches Tierbett',
    descZh: '简约北欧设计，柔软舒适，给爱宠一个温馨的休息空间。采用优质棉麻面料，透气亲肤，可拆洗设计方便清洁。',
    descEn: 'Minimalist Nordic design, soft and comfortable, giving your pet a cozy resting space. Made with premium cotton-linen fabric, breathable and skin-friendly, with removable cover for easy cleaning.',
    descEs: 'Disegno nordico minimalista, suave y comodo, ofrece a tu mascota un espacio de descanso acogedor. Fabricado con tela premium de algodon-lino, transpirable y amigable con la piel.',
    descFr: 'Design nordique minimaliste, doux et confortable, offrant a votre animal un espace de repos douillet. Fabrique avec un tissu premium coton-lin, respirant et agreable pour la peau.',
    descDe: 'Minimalistisches nordisches Design, weich und bequem, bietet Ihrem Tier eine gemutlich Ruheraum. Aus Premium-Baumwoll-Leinen-Stoff, atmungsaktiv und hautfreundlich.',
    price: 299, originalPrice: 459, images: ['https://images.unsplash.com/photo-1585071550721-fdb362ae2b8d?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&h=600&fit=crop'], category: 'beds', rating: 4.8, stock: 50, isHot: true, isNew: false,
  },
  {
    nameZh: '可伸缩宠物牵引绳', nameEn: 'Retractable Pet Leash', nameEs: 'Correa Retractil', nameFr: 'Laisse Retractable', nameDe: 'Retraktive Tierleine',
    descZh: '一键收放，5米可伸缩长度，舒适手柄设计，夜间反光条保障安全出行。',
    descEn: 'One-button retract, 5m extendable length, comfortable handle design, reflective strips for safe night walks.',
    descEs: 'Retraccion con un boton, 5m de longitud extensible, mango comodo, tiras reflectantes para paseos nocturnos seguros.',
    descFr: 'Retraction a un bouton, longueur extensible de 5m, poignee confortable, bandes reflectantes pour des promenades nocturnes sures.',
    descDe: 'Ein-Knopf-Retraktion, 5m ausfahrbar, bequemer Griff, Reflektorstreifen fur sichere Nachtwanderungen.',
    price: 128, originalPrice: 199, images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop'], category: 'collars', rating: 4.6, stock: 200, isHot: true, isNew: false,
  },
  {
    nameZh: '智能互动玩具球', nameEn: 'Smart Interactive Toy Ball', nameEs: 'Pelota Interactiva Inteligente', nameFr: 'Balle Interactive Intelligente', nameDe: 'Intelligente Interaktive Spielzeugkugel',
    descZh: '自动滚动，不规则运动轨迹，激发宠物狩猎本能。USB充电，超长续航。',
    descEn: 'Auto-rolling with irregular movement patterns, stimulating hunting instincts. USB rechargeable with long battery life.',
    descEs: 'Rodamiento automatico con patrones de movimiento irregulares, estimula los instintos de caza. Recargable por USB con larga duracion de bateria.',
    descFr: 'Roulement automatique avec modes de mouvement irreguliers, stimulant les instincts de chasse. Rechargeable par USB avec une longue autonomie.',
    descDe: 'Automatisches Rollen mit unregelmassigen Bewegungsmustern, stimuliert Jagdinstinkte. USB-aufladbar mit langer Akkulaufzeit.',
    price: 168, originalPrice: 258, images: ['https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600&h=600&fit=crop'], category: 'toys', rating: 4.7, stock: 80, isHot: true, isNew: true,
  },
  {
    nameZh: '航空级宠物外出包', nameEn: 'Airline Pet Carrier', nameEs: 'Transportadora Aerea', nameFr: 'Sac de Transport Aeronautique', nameDe: 'Flugzeuggeeignete Transporttasche',
    descZh: '符合国际航空运输标准，透气网面设计，加厚底部，让爱宠出行更安心。',
    descEn: 'Meets international airline standards, breathable mesh design, reinforced bottom for safe pet travel.',
    descEs: 'Cumple con estandares aerolineas internacionales, diseno de malla transpirable, fondo reforzado para viajes seguros.',
    descFr: 'Conforme aux normes aeronautiques internationales, design en maille respirante, fond renforce pour des voyages en toute securite.',
    descDe: 'Erfullt internationale Flugstandards, atmungsaktives Netzdesign, versterkter Boden fur sicheres Reisen.',
    price: 388, originalPrice: 528, images: ['https://images.unsplash.com/photo-1586495985370-7866e10d1a82?w=600&h=600&fit=crop'], category: 'carriers', rating: 4.9, stock: 30, isHot: true, isNew: false,
  },
  {
    nameZh: '宠物美容梳套装', nameEn: 'Pet Grooming Brush Set', nameEs: 'Set de Cepillos de Estetica', nameFr: 'Set de Brosses de Toilettage', nameDe: 'Tierpflege-Bursten-Set',
    descZh: '专业级5件套，针梳、排梳、开结梳、按摩梳、美容剪刀，一应俱全。',
    descEn: 'Professional 5-piece set: pin brush, comb, dematting comb, massage brush, and grooming scissors.',
    descEs: 'Set profesional de 5 piezas: cepillo de pines, peine, peine desenredante, cepillo masajeador y tijeras de estetica.',
    descFr: 'Set professionnel de 5 pieces: brosse a picots, peigne, peigne demelant, brosse massante et ciseaux de toilettage.',
    descDe: 'Professionelles 5-teiliges Set: Nstenburste, Kamm, Entfilzungskamm, Massageburste und Pflegeschere.',
    price: 158, images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=600&fit=crop'], category: 'grooming', rating: 4.5, stock: 120, isHot: false, isNew: true,
  },
  {
    nameZh: '法式复古宠物项圈', nameEn: 'French Vintage Pet Collar', nameEs: 'Collar Vintage Frances', nameFr: 'Collier Vintage Francais', nameDe: 'Franzosischer Vintage-Tierhalsband',
    descZh: '复古丝带设计，黄铜五金件，手工缝制，展现优雅品味。',
    descEn: 'Vintage ribbon design, brass hardware, hand-stitched for an elegant look.',
    descEs: 'Diseno de cinta vintage, herrajes de laton, cosido a mano para un look elegante.',
    descFr: 'Design de ruban vintage, quincaillerie en laiton, cousu a main pour un look elegant.',
    descDe: 'Vintage-Band-Design, Messingbeschlage, handgenaht fur einen eleganten Look.',
    price: 218, originalPrice: 298, images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&h=600&fit=crop'], category: 'collars', rating: 4.8, stock: 60, isHot: true, isNew: false,
  },
  {
    nameZh: '轻量宠物冲锋衣', nameEn: 'Lightweight Pet Rain Jacket', nameEs: 'Chaqueta de Lluvia Ligera', nameFr: 'Veste de Pluie Legere', nameDe: 'Leichte Regenjacke fur Tiere',
    descZh: '防水透气面料，反光条设计，轻便不束缚，雨天出行必备。',
    descEn: 'Waterproof breathable fabric, reflective design, lightweight and non-restrictive. Essential for rainy day walks.',
    descEs: 'Tela impermeable y transpirable, diseno reflectante, ligera y sin restricciones. Esencial para paseos lluviosos.',
    descFr: 'Tissu impermeable et respirant, design reflectant, leger et sans restriction. Essentiel pour les promenades pluvieuses.',
    descDe: 'Wasserdichter atmungsaktiver Stoff, reflektierendes Design, leicht und uneingeschrankt. Unverzichtbar fur Regentage.',
    price: 258, originalPrice: 368, images: ['https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=600&h=600&fit=crop'], category: 'clothing', rating: 4.6, stock: 45, isHot: false, isNew: true,
  },
  {
    nameZh: '慢食碗益智玩具', nameEn: 'Slow Feeder Puzzle Toy', nameEs: 'Juguete Puzzle de Alimentacion Lenta', nameFr: 'Jouet Puzzle Alimentation Lente', nameDe: 'Langsamfutter-Puzzle-Spielzeug',
    descZh: '多格迷宫设计，延长进食时间，促进智力发展，防止狼吞虎咽。',
    descEn: 'Multi-compartment maze design, extends feeding time, promotes mental development, prevents gulping.',
    descEs: 'Diseno de laberinto multicompartmento, extiende el tiempo de alimentacion, promueve el desarrollo mental, previene el tragado.',
    descFr: 'Design de labyrinthe multi-compartiments, prolonge le temps d\'alimentation, favorise le developpement mental, prevale l\'avale.',
    descDe: 'Mehrkompartimentes Labyrinth-Design, verlangert die Futterzeit, fordert die mentale Entwicklung, verhindert das Schlingen.',
    price: 88, originalPrice: 138, images: ['https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=600&h=600&fit=crop'], category: 'toys', rating: 4.4, stock: 150, isHot: false, isNew: false,
  },
  {
    nameZh: '记忆棉宠物垫', nameEn: 'Memory Foam Pet Mat', nameEs: 'Alfombra de Espuma Viscoelastica', nameFr: 'Tapis en Mousse a Memoire', nameDe: 'Memory-Schaum Tiermatte',
    descZh: '高品质记忆棉，贴合身体曲线，缓解关节压力，适合老年宠物。',
    descEn: 'Premium memory foam, contours to body shape, relieves joint pressure, ideal for senior pets.',
    descEs: 'Espuma viscoelastica premium, se adapta a la forma del cuerpo, alivia la presion articular, ideal para mascotas mayores.',
    descFr: 'Mousse a memoire premium, epouse la forme du corps, soulage la pression articulaire, ideal pour les animaux ages.',
    descDe: 'Premium-Memory-Schaum, passt sich der Korperform an, entlastet die Gelenke, ideal fur Seniorentiere.',
    price: 358, originalPrice: 498, images: ['https://images.unsplash.com/photo-1585071550721-fdb362ae2b8d?w=600&h=600&fit=crop'], category: 'beds', rating: 4.9, stock: 25, isHot: true, isNew: false,
  },
  {
    nameZh: '可折叠宠物推车', nameEn: 'Foldable Pet Stroller', nameEs: 'Cochecito Plegable para Mascotas', nameFr: 'Poussette Pliable pour Animaux', nameDe: 'Klappbarer Tierwagen',
    descZh: '一键折叠，4轮万向，承重25kg，带刹车系统，出行购物好帮手。',
    descEn: 'One-hand fold, 4-wheel 360° rotation, 25kg capacity, brake system. Perfect for outings and shopping.',
    descEs: 'Plegado con una mano, 4 ruedas 360°, capacidad 25kg, sistema de frenos. Perfecto para paseos y compras.',
    descFr: 'Pliage a une main, 4 roues 360°, capacite 25kg, systeme de frein. Parfait pour les promenades et le shopping.',
    descDe: 'Einhand-Faltung, 4-Rad-360°-Drehung, 25kg Tragkraft, Bremssystem. Perfekt fur Ausfluge und Einkaufe.',
    price: 688, originalPrice: 928, images: ['https://images.unsplash.com/photo-1586495985370-7866e10d1a82?w=600&h=600&fit=crop'], category: 'carriers', rating: 4.7, stock: 15, isHot: true, isNew: true,
  },
  {
    nameZh: '天然橡胶磨牙棒', nameEn: 'Natural Rubber Chew Toy', nameEs: 'Juguete Masticable de Caucho Natural', nameFr: 'Jouet a Macher en Caoutchouc Naturel', nameDe: 'Naturkautschuk-Kauspielzeug',
    descZh: '100%天然橡胶，耐咬耐磨，可填食设计，清洁牙齿，减轻焦虑。',
    descEn: '100% natural rubber, durable and bite-resistant, fillable design, cleans teeth, reduces anxiety.',
    descEs: '100% caucho natural, duradero y resistente a mordidas, diseno rellenable, limpia dientes, reduce la ansiedad.',
    descFr: '100% caoutchouc naturel, durable et resistant aux morsures, design remplissable, nettoie les dents, reduit l\'anxiete.',
    descDe: '100% Naturkautschuk, langlebig und bissfest, fullbares Design, reinigt Zahne, reduziert Angst.',
    price: 68, images: ['https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600&h=600&fit=crop'], category: 'toys', rating: 4.3, stock: 300, isHot: false, isNew: false,
  },
  {
    nameZh: '宠物烘干箱', nameEn: 'Pet Drying Box', nameEs: 'Caja de Secado para Mascotas', nameFr: 'Boite de Sechage pour Animaux', nameDe: 'Trocknungsbox fur Tiere',
    descZh: '恒温烘干，低噪音设计，大容量，洗完澡快速干毛，告别湿漉漉。',
    descEn: 'Constant temperature drying, low noise design, large capacity. Quick drying after bath, no more wet fur.',
    descEs: 'Secado a temperatura constante, diseno de bajo ruido, gran capacidad. Secado rapido despues del bano.',
    descFr: 'Sechage a temperature constante, design faible bruit, grande capacite. Sechage rapide apres le bain.',
    descDe: 'Temperaturkonstantes Trocknen, leises Design, grosse Kapazitat. Schnelles Trocknen nach dem Baden.',
    price: 568, originalPrice: 788, images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=600&fit=crop'], category: 'grooming', rating: 4.6, stock: 20, isHot: false, isNew: true,
  },
];

const CATEGORIES = [
  { slug: 'toys', nameZh: '玩具', nameEn: 'Toys', nameEs: 'Juguetes', nameFr: 'Jouets', nameDe: 'Spielzeug', icon: 'Puzzle', sortOrder: 1 },
  { slug: 'beds', nameZh: '窝垫', nameEn: 'Beds & Mats', nameEs: 'Camas y Mantas', nameFr: 'Lits et Tapis', nameDe: 'Betten & Matten', icon: 'Bed', sortOrder: 2 },
  { slug: 'carriers', nameZh: '外出包', nameEn: 'Carriers', nameEs: 'Transportadoras', nameFr: 'Sacs de Transport', nameDe: 'Transporttaschen', icon: 'ShoppingBag', sortOrder: 3 },
  { slug: 'grooming', nameZh: '美容护理', nameEn: 'Grooming', nameEs: 'Cuidado y Estetica', nameFr: 'Soins et Esthetique', nameDe: 'Pflege & Schonheit', icon: 'Scissors', sortOrder: 4 },
  { slug: 'collars', nameZh: '项圈牵引', nameEn: 'Collars & Leashes', nameEs: 'Collares y Correas', nameFr: 'Colliers et Laisses', nameDe: 'Halsbander & Leinen', icon: 'Link', sortOrder: 5 },
  { slug: 'clothing', nameZh: '服饰', nameEn: 'Clothing', nameEs: 'Ropa', nameFr: 'Vetements', nameDe: 'Bekleidung', icon: 'Shirt', sortOrder: 6 },
];

const PROMOTIONS = [
  {
    titleZh: '限时闪购', titleEn: 'Flash Sale', titleEs: 'Venta Flash', titleFr: 'Vente Flash', titleDe: 'Blitzangebot',
    subtitleZh: '全场热门商品低至5折', subtitleEn: 'Up to 50% off on hot items', subtitleEs: 'Hasta 50% de descuento', subtitleFr: "Jusqu'a 50% de reduction", subtitleDe: 'Bis zu 50% Rabatt',
    type: 'flash', discount: 50, bgColor: '#1C1917',
  },
  {
    titleZh: '超值套装', titleEn: 'Bundle Deals', titleEs: 'Paquetes', titleFr: 'Lots Avantageux', titleDe: 'Set-Angebote',
    subtitleZh: '买二送一，组合更划算', subtitleEn: 'Buy 2 Get 1 Free', subtitleEs: 'Compra 2 Lleva 1 Gratis', subtitleFr: 'Achetez 2 Recevez 1 Gratuit', subtitleDe: 'Kaufen Sie 2 Bekommen Sie 1 Gratis',
    type: 'bundle', discount: 33, bgColor: '#44403C',
  },
  {
    titleZh: '季节特卖', titleEn: 'Seasonal Sale', titleEs: 'Rebajas de Temporada', titleFr: 'Soldes de Saison', titleDe: 'Saisonsale',
    subtitleZh: '换季清仓，好物不留憾', subtitleEn: 'Seasonal clearance, grab before they are gone', subtitleEs: 'Liquidacion de temporada', subtitleFr: 'Liquidation saisonniere', subtitleDe: 'Saison-Ausverkauf',
    type: 'seasonal', discount: 40, bgColor: '#292524',
  },
];

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.paymentRecord.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.adminUser.deleteMany();

  // Seed categories
  for (const cat of CATEGORIES) {
    await prisma.category.create({ data: cat });
  }

  // Seed products
  for (const product of PRODUCTS) {
    await prisma.product.create({ data: product });
  }

  // Seed promotions
  for (const promo of PROMOTIONS) {
    await prisma.promotion.create({ data: promo });
  }

  // Seed admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@patapacha.com' },
    update: {},
    create: {
      email: 'admin@patapacha.com',
      passwordHash,
      name: 'Pata Pacha Admin',
    },
  });

  // Seed default site config
  await prisma.siteConfig.upsert({
    where: { key: 'hero_slides' },
    update: {},
    create: {
      key: 'hero_slides',
      value: [
        { image: '/hero-fiesta.jpg', titleKey: 'hero_title_1', subtitleKey: 'hero_subtitle_1', ctaKey: 'hero_cta_1' },
        { image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=600&fit=crop', titleKey: 'hero_title_2', subtitleKey: 'hero_subtitle_2', ctaKey: 'hero_cta_2' },
        { image: 'https://images.unsplash.com/photo-1450778869180-e12d8520f945?w=1200&h=600&fit=crop', titleKey: 'hero_title_3', subtitleKey: 'hero_subtitle_3', ctaKey: 'hero_cta_3' },
      ],
    },
  });

  await prisma.siteConfig.upsert({
    where: { key: 'homepage_sections' },
    update: {},
    create: {
      key: 'homepage_sections',
      value: [
        { id: 'hero', visible: true, order: 1 },
        { id: 'categories', visible: true, order: 2 },
        { id: 'hot_products', visible: true, order: 3 },
        { id: 'promotions', visible: true, order: 4 },
        { id: 'brand_story', visible: true, order: 5 },
      ],
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
