import { signatureSheet, signaturePositions } from './art/joker-signatures.mjs?v=1';

/*
 * Contre-Pli pixel Joker illustrations.
 * An original 50 × 75 pixel-card layout, based on the CC0 blank-card format
 * published by Jfred ("Pixel Cards", https://jfredd.itch.io/pixel-cards).
 * No Balatro character artwork or sprites have been imported.
 * The artwork is presentation-only; Joker numeric IDs and effects are untouched.
 */
const PALETTES = [
  ['#102b3d','#376f85','#f9dc85','#f3b96b','#d65d65'],
  ['#30203e','#72578b','#fbe6b2','#e698d1','#ee727c'],
  ['#163a37','#3a8074','#fde2a7','#b2e6bd','#d6aa5c'],
  ['#3a2936','#956074','#ffe3a8','#ecb676','#ee7855'],
  ['#202d50','#576eae','#f8e2ae','#9bd4f4','#dca4da'],
  ['#3d3028','#9c7550','#f6dfae','#e6ba76','#ad83a4']
];
const rect = (x,y,w,h,fill,stroke) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'" stroke-width="1"':'')+'/>';
const path = (d,fill,stroke,width=2) => '<path d="'+d+'" fill="'+(fill||'none')+'"'+(stroke?' stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="square" stroke-linejoin="miter"':'')+'/>';
const circle = (x,y,r,fill,stroke,width=2) => '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(fill||'none')+'"'+(stroke?' stroke="'+stroke+'" stroke-width="'+width+'"':'')+'/>';
function scene(kind, A, B, C, D) {
  const ink='#152439', hi='#ffedd0';
  switch (kind % 24) {
    case 0: // Boussole
      return circle(21,27,17,ink,A,2)+circle(21,27,12,B,C,2)+path('M21 10L26 27 21 44 16 27Z',A,ink)+path('M21 14L25 27 21 24Z',C)+circle(21,27,3,hi,ink);
    case 1: // Cerf-volant
      return path('M21 6L36 27 21 37 6 27Z',A,ink)+path('M21 6V37M6 27H36','none',C,2)+path('M21 37Q3 44 13 54T20 68','none',hi,2)+path('M10 48L5 43 15 45Z',D)+path('M17 59L13 55 23 57Z',D);
    case 2: // Fleur des vents
      return path('M21 3L26 17 38 9 31 23 42 28 29 33 36 45 23 39 20 51 16 38 3 43 10 30 1 23 14 19Z',A,ink)+circle(21,27,9,C,ink)+circle(21,27,4,B);
    case 3: // Girouette
      return path('M20 5H24V51H20Z',B,ink)+path('M5 18L28 12 39 19 28 26Z',C,ink)+path('M8 19L28 19','none',ink)+path('M9 52H35L30 57H14Z',A,ink)+path('M22 6L26 13H18Z',D,ink);
    case 4: // Ancre
      return circle(21,12,6,'none',C,3)+path('M21 18V49M12 25H30M7 37Q9 55 21 55T35 37','none',A,4)+path('M7 36L4 44 12 42Z',C)+path('M35 36L38 44 30 42Z',C)+circle(21,31,4,hi,ink);
    case 5: // Fanion
      return path('M12 7V61','none',C,3)+path('M14 9L38 13 30 25 38 35 14 31Z',A,ink)+path('M18 14L28 19 18 27Z',B)+path('M4 60H24','none',C,3);
    case 6: // L'orbite
      return circle(21,30,11,A,ink)+path('M1 40Q12 9 40 22Q32 52 1 40Z','none',C,3)+circle(37,22,5,D,ink)+circle(21,30,3,hi)+path('M21 11V6M2 24L5 21M34 46L38 50','none',hi,2);
    case 7: // Balise et phare
      return path('M15 52L18 18H27L31 52Z',C,ink)+path('M18 18L16 11 29 11 27 18Z',A,ink)+rect(19,25,8,8,hi,ink)+rect(13,51,20,5,B,ink)+path('M14 25L2 15M31 25L40 15','none',D,3)+path('M5 63Q12 60 20 63T39 63','none',A,2);
    case 8: // Quai lunaire
      return path('M29 6A11 11 0 1 0 36 20A10 10 0 0 1 29 6Z',C)+path('M5 40H39L32 50H12Z',A,ink)+path('M10 33H29V40H10Z',B,ink)+rect(14,26,9,7,D,ink)+path('M3 56Q9 52 15 56T28 56T41 56M3 63Q9 59 15 63T28 63T41 63','none',C,2);
    case 9: // Veilleuse
      return path('M13 20H29L34 51H8Z',A,ink)+path('M17 20V12H25V20','none',C,3)+path('M12 28H30V45H12Z',D,ink)+path('M21 41Q8 34 21 24Q34 34 21 41Z',C,ink)+circle(21,32,3,hi);
    case 10: // Echo
      return circle(21,29,5,C,ink)+path('M13 17Q3 29 13 41M29 17Q39 29 29 41M8 10Q-5 29 8 48M34 10Q47 29 34 48','none',A,4)+path('M10 54H32M15 60H27','none',D,2);
    case 11: // Fusée et départ
      return path('M21 3Q8 17 13 42H29Q34 17 21 3Z',A,ink)+rect(15,41,12,8,C,ink)+circle(21,24,5,hi,ink)+path('M15 49L11 63 19 56 21 67 24 56 33 63 27 49Z',D,ink)+path('M13 35L5 42 13 44M29 35L37 42 29 44',B,ink);
    case 12: // Lest et coffre
      return path('M9 17H33L38 47H4Z',A,ink)+rect(12,11,18,6,C,ink)+rect(15,26,12,9,ink,C)+rect(19,27,4,7,hi)+path('M7 53L14 49 22 53 29 49 36 53','none',D,3);
    case 13: // Chambre prisme
      return path('M21 3L38 21 35 48 21 59 7 48 4 21Z',A,ink)+path('M21 8L30 27 21 50 12 27Z',C,ink)+circle(21,28,6,B,hi)+path('M6 20L36 48M36 20L6 48','none',hi,2);
    case 14: // ADN
      return path('M12 5C37 20 5 35 30 55M30 5C5 20 37 35 12 55','none',A,4)+path('M14 10H28M10 20H32M13 30H29M10 40H32M14 50H28','none',C,3)+circle(12,5,3,D)+circle(30,55,3,D);
    case 15: // Plan
      return path('M4 15L14 9 27 14 38 9V51L27 57 14 52 4 57Z',A,ink)+path('M14 9V52M27 14V57','none',ink,2)+path('M8 24L20 19 33 26 21 41 10 36Z','none',C,3)+circle(21,41,4,D,ink);
    case 16: // Astre souverain
      return path('M21 3L28 18 41 20 31 31 34 47 21 39 8 47 11 31 1 20 15 18Z',C,ink)+circle(21,28,9,A,ink)+circle(21,28,4,hi)+path('M6 51L11 61H31L36 51','none',D,3);
    case 17: // Orbe royal
      return circle(21,28,17,A,ink)+circle(21,28,11,B,C,2)+path('M6 15L10 6 21 12 32 6 36 15Z',D,ink)+circle(21,28,5,hi,ink)+path('M12 48H30V54H12Z',C,ink);
    case 18: // Comète
      return path('M2 45L18 10 29 17 11 51Z',A,ink)+path('M6 54L26 21 36 35Z',D,ink)+circle(31,19,11,C,ink)+circle(28,16,4,hi)+path('M7 17L12 12M36 45L40 50','none',hi,2);
    case 19: // Masque
      return path('M4 13Q21 5 38 13L34 43 21 54 8 43Z',A,ink)+path('M8 25L17 24 16 31 9 33ZM25 24L34 25 33 33 26 31Z',ink)+path('M15 42Q21 48 27 42','none',C,3)+rect(18,9,6,4,C);
    case 20: // Chapeau
      return path('M11 37L14 13H29L32 37Z',A,ink)+path('M3 37H39V44H3Z',C,ink)+path('M13 27H30V32H13Z',D,ink)+path('M14 49Q21 54 28 49','none',hi,3);
    case 21: // Cartes
      return path('M5 11L24 8 30 43 11 47Z',C,ink)+path('M16 15L37 19 33 56 12 52Z',A,ink)+path('M24 29L30 36 23 43 18 35Z',D,ink)+path('M14 18L17 22 14 25 11 21Z',D);
    case 22: // Sablier
      return path('M8 8H34M8 54H34M12 9Q12 23 21 29Q30 23 30 9M12 53Q12 38 21 30Q30 38 30 53','none',C,4)+path('M15 17L21 25 27 17ZM15 47L21 35 27 47Z',A)+circle(21,30,2,hi);
    default: // Dés à jouer
      return path('M7 14L30 7 37 36 14 44Z',A,ink)+circle(15,19,3,hi)+circle(22,27,3,hi)+circle(29,35,3,hi)+path('M8 50H34V59H8Z',C,ink);
  }
}
const KEY_MOTIFS = {
  adn:14,plan:15,astre:16,orbe:17,comete:18,
  baron:17,perkeo:19,canio:19,triboulet:19,yorick:19,
  blueprint:15,brainstorm:14,mime:19,'half-joker':19,
  'joker':19,'balatro-joker':19,'jolly':19,'zany':19,'mad':19,
  'crazy':19,'droll':19,stencil:20,'fortune-teller':22,
  banner:5,photograph:21,'card-sharp':21,'red-card':21,
  'flash-card':21,'loyalty-card':21,abstract:6,hologram:6,
  'campfire':11, 'ice-cream':9, 'popcorn':11,'chicot':17,
  'raised-fist':20,'drunkard':23,'splash':8,'juggler':23
};
function motifFor(joker,id) {
  if (id < 19) return id;
  const key= joker.key || '';
  if (Object.prototype.hasOwnProperty.call(KEY_MOTIFS,key)) return KEY_MOTIFS[key];
  if (/moon|night|black|dusk|eclipse/i.test(key)) return 8;
  if (/star|sun|supernova|astr|cosm/i.test(key)) return 16;
  if (/arrow|wind|runner|acrobat|swift/i.test(key)) return 1;
  if (/stone|steel|bull|onyx|agate|gem/i.test(key)) return 12;
  if (/flower|seed|green|blood/i.test(key)) return 2;
  if (/card|photograph|license|deck|baseball/i.test(key)) return 21;
  if (/face|mask|pareidolia|smil|scary/i.test(key)) return 19;
  return (id * 7 + 3) % 24;
}
export function jokerArtwork(joker,id) {
  // Dedicated original illustrations for four iconic Jokers.
  // No IDs, effects, seeds, or saved data are changed by this presentation layer.
  const sprite = signaturePositions[id];
  if (sprite) {
    return '<span class="joker-illustration joker-made-card joker-signature-image" aria-hidden="true" data-art-id="' + id + '" style="background-image:url(' + signatureSheet + ');background-size:200% 200%;background-position:' + sprite[0] + '% ' + sprite[1] + '%;background-repeat:no-repeat"></span>';
  }
  const rank = joker.legendary || joker.rarity === 'legendary' ? 3 : joker.rarity === 'rare' ? 2 : joker.rarity === 'uncommon' ? 1 : 0;
  const p=PALETTES[(id + rank * 2) % PALETTES.length];
  const [base,mid,bright,accent,warm]=p;
  const selected=motifFor(joker,id);
  const light = rank >= 2 ? '#ffebb1' : '#f8e8c7';
  const ornaments = path('M5 15V6H14M36 6H45V15M5 60V69H14M36 69H45V60', null, bright, 1);
  const sparks = [rect(4,4,2,2,bright),rect(36,8,2,2,accent),rect(8,57,2,2,warm),rect(36,57,2,2,bright)].join('');
  const tiled = Array.from({ length: 5 }, (_, n) => rect(2+(n*9+id*3)%37,7+(n*13+id)%51,2,2,mid)).join('');
  const horizon = path('M0 49L7 46 13 51 20 48 27 53 35 49 42 52V67H0Z', base, mid, 1);
  // Each Joker receives a stable, original heraldic detail, even when motifs repeat.
  // This distinguishes large inventories without altering IDs, effects or saved runs.
  const emblem = (id * 11 + selected * 3) % 4;
  const medallion = [
    path('M16 57L21 52 26 57 21 62Z',accent,bright,1),
    circle(21,57,5,accent,bright,1),
    path('M15 60L21 51 27 60Z',accent,bright,1),
    path('M16 53H26V61H16Z',accent,bright,1)
  ][emblem];
  const starfield = Array.from({ length: 4 }, (_, n) => {
    const x = 7 + ((id * 13 + n * 17) % 28);
    const y = 8 + ((id * 7 + n * 11) % 10);
    return rect(x,y,1+(n%2),1+(n%2),n%2 ? accent : bright);
  }).join('');
  const artwork = horizon + tiled + starfield + scene(selected, mid, base, bright, warm) + medallion + sparks;
  const card = '<svg class="joker-pixel-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 75" aria-hidden="true" focusable="false" shape-rendering="crispEdges">' +
    rect(0,0,50,75,'#101829') + rect(1,1,48,73,light) +
    rect(3,3,44,69,base) + rect(4,4,42,67,mid) + rect(5,5,40,65,base) +
    '<svg x="4" y="4" width="42" height="67" viewBox="0 0 42 67" overflow="hidden">' + artwork + '</svg>' +
    ornaments + rect(14,70,22,1,bright) +
    '</svg>';
  return '<span class="joker-illustration joker-made-card" aria-hidden="true" data-art-id="'+id+'">'+card+'</span>';
}
