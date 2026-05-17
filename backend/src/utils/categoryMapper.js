// backend/utils/categoryMapper.js

const semanticCategories = [
    { name: "Owoce i warzywa", desc: "świeże owoce, warzywa, jabłka, banany, pomidory, ziemniaki, sałata, cebula, cytryny, marchew", image: "/images/cat_veges.png" },
    { name: "Pieczywo i cukiernia", desc: "chleb, bułki, bagietki, rogaliki, pączki, drożdżówki, ciasta, torty, pieczywo chrupkie", image: "/images/cat_bakery.png" },
    { name: "Nabiał i jaja", desc: "jogurt pitny, mleko, sery żółte, ser salami, sery pleśniowe, jogurty, masło, śmietana, jaja, twaróg, kefir, margaryna", image: "/images/cat_dairy.png" },
    { name: "Mięso i wędliny", desc: "świeże mięso, kurczak, wieprzowina, wołowina, szynka, kiełbasa, parówki, kabanosy, boczek, kiełbasa salami", image: "/images/cat_meat.png" },
    { name: "Dania gotowe i mrożonki", desc: "pierogi, pizza, frytki mrożone, mrożone warzywa, lody, zupy w proszku, gotowe posiłki do mikrofali", image: "/images/cat_frozen.png" },
    { name: "Produkty sypkie", desc: "makaron, ryż, kasza, mąka, cukier, płatki śniadaniowe, musli, owsianka, bułka tarta", image: "/images/cat_dry.png" },
    { name: "Sosy, oleje i przyprawy", desc: "olej rzepakowy, oliwa z oliwek, ketchup, majonez, musztarda, sól, pieprz, zioła, przyprawy, sosy do słoików", image: "/images/cat_sauces.png" },
    { name: "Słodycze", desc: "czekolada, ciastka, batony, cukierki, żelki, wafle, bombonierki, lizaki, kremy czekoladowe", image: "/images/cat_sweets.png" },
    { name: "Przekąski słone", desc: "chipsy, chrupki, paluszki, orzeszki ziemne, krakersy, popcorn, precle, nasiona słonecznika", image: "/images/cat_snacks.png" },
    { name: "Kawa i herbata", desc: "kawa ziarnista, kawa mielona, kawa rozpuszczalna, herbata czarna, herbata zielona, napary ziołowe, kakao", image: "/images/cat_coffee.png" },
    { name: "Napoje gazowane i energetyki", desc: "napój gazowany, cola, pepsi, sprite, fanta, oranżada, napoje energetyczne, red bull, monster, napoje z gazem", image: "/images/cat_soda.png" },
    { name: "Napoje niegazowane i woda", desc: "napój niegazowany, woda mineralna, woda niegazowana, woda lekko gazowana, soki 100%, nektary, syropy owocowe, napoje izotoniczne", image: "/images/cat_water.png" },
    { name: "Alkohole", desc: "piwo, wino, wódka, whisky, rum, gin, likiery, szampan, cydr, napoje alkoholowe", image: "/images/cat_alcohol.png" },
    { name: "Kosmetyki i higiena", desc: "szampon, żel pod prysznic, mydło, pasta do zębów, papier toaletowy, dezodorant, kremy, maszynki do golenia", image: "/images/cat_hygiene.png" },
    { name: "Chemia gospodarcza", desc: "proszek do prania, płyn do płukania, płyn do naczyń, kostki do zmywarki, płyn do szyb, worki na śmieci, gąbki", image: "/images/cat_cleaning.png" },
    { name: "Dla zwierząt", desc: "karma dla psa, karma dla kota, puszki dla zwierząt, sucha karma, żwirek dla kota, przysmaki dla zwierząt", image: "/images/cat_pets.png" }
];

// Funkcja obliczająca odległość cosinusową (Cosinus Distance) między dwoma wektorami
function calculateCosineDistance(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    // Zwracamy odległość (im bliżej zera, tym bardziej podobne)
    return 1 - (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
}

module.exports = {
    semanticCategories,
    calculateCosineDistance
};