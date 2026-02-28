import 'dotenv/config'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import Property from '../models/Property'
import * as logger from '../utils/logger'

// Rich HTML descriptions keyed by property name (must match DB exactly)
const DESCRIPTIONS: Record<string, string> = {
  // ── TREBINJE ──────────────────────────────────
  'Apartman San': `<p>Miran i udoban apartman "San" u Trebinju, idealan za opuštajući odmor u jednom od najljepših gradova Hercegovine. Apartman je smješten u mirnom rezidencijalnom kraju sa lakim pristupom centru grada i rijeci Trebišnjici.</p>
<p>Prostor uključuje udobnu spavaću sobu sa ortopedskim madracem, dnevnu sobu sa TV-om i kaučem, potpuno opremljenu kuhinju sa svim aparatima i moderno kupatilo sa tušem. Mekan osvjetljenje i neutralni tonovi stvaraju atmosferu za odmor.</p>
<p>Trebinje nudi mnoštvo atrakcija — rijeka Trebišnjica, manastir Tvrdoš sa degustacijom vina, stari grad i Arslanagića most. Dubrovnik je udaljen samo 30km. Besplatan Wi-Fi, klima uređaj i privatni parking.</p>`,

  'Apartman Stari Grad': `<p>Luksuzno uređen apartman u samom srcu starog grada Trebinja, na samo par koraka od Arslanagića mosta i rijeke Trebišnjice. Ovaj prostrani apartman pruža savršen spoj tradicionalne hercegovačke arhitekture i modernog komfora.</p>
<p>Apartman ima potpuno opremljenu kuhinju sa svim aparatima, prostranu dnevnu sobu sa udobnim kaučom i TV-om sa ravnim ekranom, te spavaću sobu sa bračnim krevetom i ortopedskim madracem. Kupatilo je moderno opremljeno sa tušem i besplatnim toaletnim priborom.</p>
<p>Lokacija je idealna za istraživanje grada — restorani, kafići i prodavnice su na dohvat ruke. Besplatan Wi-Fi je dostupan u cijelom objektu, a privatni parking se nalazi u blizini.</p>`,

  'Vila Lastva': `<p>Elegantna vila u mirnom kraju Lastva, okružena mediteranskim zelenilom i maslinicima sa pogledom na planine. Vila je nedavno renovirana i nudi vrhunski smještaj za porodice i grupe koje traže mir i privatnost.</p>
<p>Na raspolaganju su tri prostrane spavaće sobe, svaka sa vlastitim kupatilom, te velika dnevna soba sa kaminom i izlazom na terasu. Potpuno opremljena kuhinja ima sve što vam je potrebno za pripremu obroka, uključujući mašinu za posuđe i aparat za kafu.</p>
<p>Dvorište sa roštiljem i vrtnim namještajem je idealno za opuštanje tokom ljetnih večeri. Privatni parking za dva automobila. Do centra grada se stiže za 10 minuta vožnje ili 25 minuta šetnje uz rijeku.</p>`,

  'Studio Centar': `<p>Moderno opremljen studio apartman u strogom centru Trebinja, idealan za poslovne putnikе ili parove koji traže udoban smještaj na kratki ili duži period. Kompaktan ali funkcionalan prostor sa svim potrebnim sadržajima.</p>
<p>Studio uključuje udoban bračni krevet, radni sto, mini kuhinju sa pločom za kuvanje, frižiderom i mikrotalasnom pećnicom, te moderno kupatilo sa tušem. Klima uređaj i grijanje osiguravaju ugodan boravak tokom cijele godine.</p>
<p>Nalazi se u pješačkoj zoni, okružen kafićima, restoranima i prodavnicama. Autobuska stanica je udaljena samo 5 minuta hoda. Besplatan Wi-Fi velike brzine idealan za rad na daljinu.</p>`,

  'Apartman Trebišnjica': `<p>Šarmantan apartman sa direktnim pogledom na rijeku Trebišnjicu i Arslanagića most. Renoviran u modernom stilu sa naglaskom na udobnost i funkcionalnost. Idealan za romantičan bijeg od svakodnevice.</p>
<p>Apartman uključuje prostranu spavaću sobu sa bračnim krevetom i pogledom na rijeku, dnevnu sobu sa kaučem na razvlačenje, potpuno opremljenu kuhinju i moderno kupatilo sa kadom. Balkon sa stolom i stolicama za uživanje u jutarnjoj kafi uz pogled na rijeku.</p>
<p>Lokacija je fantastična — u samom centru grada, a opet mirna zahvaljujući pogledu na rijeku. Restorani, kafići i znamenitosti grada su na pješačkoj udaljenosti. Besplatan Wi-Fi i parking.</p>`,

  'Kuća Tvrdoš': `<p>Tradicionalna hercegovačka kamena kuća u blizini čuvenog manastira Tvrdoš, potpuno renovirana za moderan život. Smještena u mirnom dijelu grada sa velikim dvorištem i pogledom na vinograde i planine.</p>
<p>Kuća ima prizemlje sa otvorenim dnevnim prostorom, kuhinjom i trpezarijom, te sprat sa tri spavaće sobe i dva kupatila. Rustikalni kameni zidovi u kombinaciji sa modernim namještajem stvaraju jedinstvenu atmosferu.</p>
<p>Dvorište sa roštiljem, ljetnom kuhinjom i vrtom sa voćkama. Privatni parking za tri automobila. Manastir Tvrdoš sa degustacijom vina je na 5 minuta vožnje. Do centra grada 10 minuta.</p>`,

  'Lux Penthouse': `<p>Ekskluzivni penthouse apartman na vrhu novogradnje sa panoramskim pogledom na grad Trebinje, rijeku Trebišnjicu i okolne planine. Luksuzan smještaj za goste koji traže nešto posebno.</p>
<p>Apartman od 90m² uključuje prostranu dnevnu sobu sa floor-to-ceiling prozorima, modernu otvorenu kuhinju sa premium aparatima, master spavaću sobu sa en-suite kupatilom i walk-in garderobom, te drugu spavaću sobu sa vlastitim kupatilom.</p>
<p>Prostrana terasa od 30m² sa ležaljkama, stolom za objedovanje i pogledom koji oduzima dah. Garažno parking mjesto, lift, klima uređaj, podno grijanje u kupatilima. Smart TV sa streaming servisima.</p>`,

  'Apartman Platani': `<p>Prostrani apartman u mirnom kraju okružen stoljetnim platanima, odakle i nosi ime. Savršen izbor za goste koji žele mir i privatnost, a opet blizinu centra grada Trebinja.</p>
<p>Apartman se prostire na 65m² i uključuje dnevnu sobu sa kuhinjom otvorenog koncepta, jednu spavaću sobu sa bračnim krevetom i jednu sa dva odvojena kreveta. Moderno kupatilo, terasa sa pogledom na vrt i planine.</p>
<p>Potpuno opremljena kuhinja sa svim aparatima, besplatan Wi-Fi, klima uređaj, TV sa satelitskim programima. Privatni parking u dvorištu. Do centra grada se stiže za 10 minuta vožnje ili 25 minuta šetnje uz rijeku.</p>`,

  'Vila Arslanagića Most': `<p>Elegantna vila sa pogledom na čuveni Arslanagića most, jedan od najljepših primjera osmanske arhitekture u regiji. Vila kombinuje tradicionalne hercegovačke elemente sa modernim luksuzom.</p>
<p>Na raspolaganju su četiri prostrane spavaće sobe, tri kupatila, dnevna soba sa kaminom i direktnim pogledom na most, te potpuno opremljena kuhinja sa trpezarijom. Svaka soba ima pogled na rijeku ili vrt.</p>
<p>Prostrano dvorište sa terasom uz rijeku, roštiljem i vrtnim namještajem. Privatni parking za tri automobila. Arslanagića most je doslovno ispred kuće, a centar grada na 5 minuta šetnje. Besplatan Wi-Fi.</p>`,

  'Gradska Kuća': `<p>Renovirana gradska kuća u centru Trebinja sa autentičnim kamenim fasadom i modernim enterijerom. Idealna za porodice ili grupe koje žele biti u srcu grada uz sav komfor doma.</p>
<p>Kuća ima dva sprata — prizemlje sa prostranom dnevnom sobom, kuhinjom i trpezarijom, te sprat sa tri spavaće sobe i dva kupatila. Kameni zidovi, drvene grede i handmade detalji stvaraju toplu atmosferu.</p>
<p>Lokacija u centru grada znači da su restorani, kafići, tržnica i sve znamenitosti na pješačkoj udaljenosti. Privatni parking u dvorištu, besplatan Wi-Fi, klima uređaj i grijanje za cjelogodišnji komfor.</p>`,

  // ── MOSTAR ────────────────────────────────────
  'Apartman Stari Most': `<p>Autentičan apartman u srcu Starog grada Mostara, na samo 100 metara od čuvenog Starog mosta (UNESCO). Smješten u renoviranoj kamenoj kući iz osmanskog perioda, ovaj apartman nudi jedinstveno iskustvo boravka u srcu historije.</p>
<p>Apartman kombinuje tradicionalne elemente — kamene zidove, drvene grede na stropu i ručno rađene detalje — sa modernim komforom. Prostrana spavaća soba sa bračnim krevetom, dnevna soba sa pogledom na Stari grad, potpuno opremljena kuhinja i kupatilo sa tušem.</p>
<p>Lokacija je nenadmašiva — izađete iz apartmana i nalazite se u srcu Starog grada sa poznatom Kujundžiluk ulicom, restoranima sa pogledom na Neretvu i brojnim kulturnim znamenitostima. Klima uređaj, besplatan Wi-Fi.</p>`,

  'Vila Blagaj': `<p>Tradicionalna bosanska kuća u selu Blagaj, na samo 500 metara od poznatog vrela Bune i Tekije. Potpuno renovirana sa očuvanim tradicionalnim elementima i modernim komforom. Idealna za goste koji žele autentično iskustvo.</p>
<p>Kuća ima tri spavaće sobe, dva kupatila, prostranu dnevnu sobu sa kaminom i kuhinju sa trpezarijom. Kameni zidovi, drveni pod i ručno tkani ćilimi stvaraju toplu i autentičnu atmosferu. Svaka soba ima pogled na vrt ili planine.</p>
<p>Dvorište sa voćnjakom, roštiljem i mjestom za sjedenje pod lozom. Vrelo Bune i Tekija su na 5 minuta šetnje — jedan od najljepših prirodnih fenomena u Bosni. Privatni parking, besplatan Wi-Fi. Do centra Mostara 12 km.</p>`,

  'Studio Mepas': `<p>Moderan studio apartman u neposrednoj blizini Mepas Mall-a, najmodernijeg šoping centra u Mostaru. Novoizgrađen objekat sa liftom, garažom i svim savremenim sadržajima za kratke ili duže boravke.</p>
<p>Studio od 35m² uključuje udoban bračni krevet, radni kutak sa stolom i stolicom, mini kuhinju sa aparatom za kafu i mikrotalasnom, te moderno kupatilo sa tušem. Veliki prozori osiguravaju obilje prirodnog svjetla.</p>
<p>Iz apartmana možete pješice do Mepas Mall-a (2 minuta), restorana, kina i sportskih terena. Do Starog mosta 15 minuta šetnje. Garažno parking mjesto, besplatan Wi-Fi, klima uređaj. Smart TV sa Netflix-om.</p>`,

  'Apartman Neretva': `<p>Elegantan apartman sa pogledom na rijeku Neretvu i njenu čuvenu emeraldno zelenu boju. Smješten u modernoj zgradi na obali rijeke, nudi jedinstveno iskustvo života uz jednu od najljepših rijeka Evrope.</p>
<p>Apartman od 60m² sa dvije spavaće sobe, potpuno opremljenom kuhinjom, prostranom dnevnom sobom sa panoramskim pogledom na Neretvu i modernim kupatilom. Balkon sa stolom i stolicama direktno iznad rijeke.</p>
<p>Kajaci i SUP daske dostupni u blizini za avanturiste. Do Starog mosta 10 minuta šetnje uz rijeku. Privatni parking, klima uređaj, besplatan Wi-Fi. Restorani sa svježom pastrmkom na dohvat ruke.</p>`,

  'Kuća Počitelj': `<p>Autentična kamena kuća u Počitelju, srednjovjekovnom gradu-muzeju na obali Neretve, samo 30 km od Mostara. Potpuno renovirana sa očuvanom historijskom strukturom i modernim sadržajima za ugodan boravak.</p>
<p>Kuća ima tri spavaće sobe, dva kupatila, rustičnu dnevnu sobu sa kaminom i kuhinju sa trpezarijom. Kameni zidovi, drvena stolarija i terakota podovi stvaraju autentičnu bosansku atmosferu. Pogled na tvrđavu i Neretvu.</p>
<p>Počitelj je jedno od najfotogeničnijih mjesta u BiH — srednjovjekovna tvrđava, Šišman Ibrahim-pašina džamija, uske kaldrme i galerije umjetnika. Privatni parking, Wi-Fi. Idealno za ljubitelje historije i umjetnosti.</p>`,

  'Lux Suite Mostar': `<p>Spektakularan luksuzni suite na vrhu moderne zgrade sa 360° pogledom na Mostar — od Starog mosta i minareta do planina Veleža i Prenj. Luksuzan smještaj za posebne prilike i goste koji traže nezaboravno iskustvo.</p>
<p>Suite od 100m² uključuje master spavaću sobu sa jacuzzi kadom i pogledom na grad, drugu spavaću sobu sa en-suite kupatilom, otvoreni dnevni prostor sa premium kuhinjom, i trpezariju za 8 osoba.</p>
<p>Krovna terasa sa ležaljkama, lounge setom i pogledom koji oduzima dah — posebno magičan za vrijeme zalaska sunca i noću kada se grad osvijetli. Dva garažna mjesta, lift, smart home sistem.</p>`,

  'Apartman Muslibegović': `<p>Elegantan apartman inspirisan bogatom osmanskom baštinom Mostara, smješten u blizini čuvene kuće Muslibegovića. Tradicionalni bosanski dizajn sa modernim komforom za nezaboravan boravak u srcu grada.</p>
<p>Apartman od 55m² sa prostranom spavaćom sobom sa bračnim krevetom, dnevnom sobom uređenom u orijentalnom stilu, potpuno opremljenom kuhinjom i kupatilom sa tradicionalnim hamam elementima.</p>
<p>Lokacija je idealna — Stari grad, bazari, restorani sa tradicionalnom bosanskom kuhinjom i kulturne znamenitosti su na par minuta hoda. Besplatan Wi-Fi, klima uređaj. Parking u blizini.</p>`,

  'Vila Fortica': `<p>Moderna vila u elitnom dijelu Mostara sa pogledom na stari grad i okolne planine. Okružena uređenim vrtom sa bazenom, nudi luksuz i privatnost za zahtjevne goste.</p>
<p>Vila ima četiri spavaće sobe, tri kupatila (uključujući master en-suite sa jacuzzijem), otvoreni dnevni prostor sa modernom kuhinjom i trpezarijom, te home cinema sobu. Svaka prostorija je dizajnerski uređena sa premium materijalima.</p>
<p>Privatni bazen (10x5m), sun deck, roštilj i ljetna kuhinja u uređenom vrtu. Garaža za dva automobila, alarm sistem, klima uređaj, podno grijanje. Do Starog mosta 15 minuta vožnje. Idealno za porodice.</p>`,

  // ── NEUM ──────────────────────────────────────
  'Apartman Plaža': `<p>Apartman na prvoj liniji do mora, bukvalno 30 metara od plaže u Neumu. Savršen za porodice sa djecom koje žele bezbrižan odmor sa lakim pristupom moru i svim sadržajima.</p>
<p>Apartman od 65m² sa dvije spavaće sobe (bračni krevet + dva odvojena kreveta), dnevnom sobom sa razvlačivim kaučom, potpuno opremljenom kuhinjom i kupatilom. Velika terasa sa pogledom na more i placu.</p>
<p>Plaža je doslovno ispred kuće — idealno za porodice sa malom djecom. Restorani, slastičarne i prodavnice u neposrednoj blizini. Klima uređaj, Wi-Fi, parking. Iznajmljivanje čamaca i vodeni sportovi na plaži.</p>`,

  'Vila Sunce': `<p>Prostrana vila sa bazenom na brežuljku iznad Neuma sa panoramskim pogledom na more i otoke. Luksuzno opremljena za nezaboravan primorski odmor za porodice ili grupe prijatelja.</p>
<p>Vila ima četiri spavaće sobe (svaka sa pogledom na more), tri kupatila, prostranu dnevnu sobu sa izlazom na terasu, modernu kuhinju sa svim aparatima i trpezariju. Mediteranski stil sa kamenim detaljima i drvenim gredama.</p>
<p>Infinity bazen sa pogledom na more, sun deck sa ležaljkama, roštilj i ljetna kuhinja. Vrt sa maslinama, lavandom i ružmarinom. Privatni parking, klima uređaj, Wi-Fi. Do plaže 5 minuta vožnje ili 15 minuta šetnje.</p>`,

  'Studio More': `<p>Moderan studio apartman sa balkonom i pogledom na more, smješten u novoizgrađenom objektu u centru Neuma. Idealan za parove koji traže udoban i pristupačan smještaj uz more.</p>
<p>Studio od 30m² sa bračnim krevetom, mini kuhinjom (ploča, frižider, mikrovalna), kupatilom sa tušem i balkonom sa pogledom na more. Moderno opremljen sa klimom, TV-om i Wi-Fi-jem.</p>
<p>Lokacija u centru Neuma znači da su plaže, restorani, prodavnice i šetalište na par minuta hoda. Idealna baza za izlete u Dubrovnik, na Pelješac ili na otoke. Parking u garaži zgrade.</p>`,

  'Apartman Jadran': `<p>Prekrasan apartman sa direktnim pogledom na Jadransko more, smješten na sunčanoj strani Neuma — jedinog primorskog grada u Bosni i Hercegovini. Samo 50 metara od plaže, idealan za ljetni odmor.</p>
<p>Apartman od 55m² sa velikom terasom okrenutom ka moru, dnevnom sobom sa kuhinjom otvorenog koncepta, spavaćom sobom sa bračnim krevetom i kupatilom sa tušem. Terasa sa stolom, stolicama i ležaljkama — vaš privatni kutak za uživanje u morskom pogledu.</p>
<p>Plaža je na 2 minute hoda, restorani sa svježom ribom u neposrednoj blizini. Klima uređaj, besplatan Wi-Fi, satellite TV. Privatni parking. Savršena lokacija za istraživanje obale — Dubrovnik 60km, Korčula, Pelješac u blizini.</p>`,

  'Penthouse Neum': `<p>Ekskluzivni penthouse apartman na vrhu hotela sa neometanim 180° pogledom na Jadransko more, otoke i zalazak sunca. Luksuzno opremljen za goste koji traže premium primorski doživljaj.</p>
<p>Penthouse od 85m² sa master spavaćom sobom sa en-suite kupatilom i pogledom na more, drugom spavaćom sobom, gostinjskim WC-om, otvorenim dnevnim prostorom sa premium kuhinjom i trpezarijom za 6 osoba.</p>
<p>Ogromna terasa od 40m² sa jacuzzijem, ležaljkama i lounge setom — vaš privatni oasis sa pogledom na more. Pristup hotelskom bazenu i spa centru. Garažno mjesto, klima uređaj, smart TV, Wi-Fi. Restoran i bar u prizemlju.</p>`,

  'Kuća Klek': `<p>Tradicionalna dalmatinska kamena kuća na poluostrvu Klek, samo 5 km od Neuma. Mirna lokacija okružena mediteranskom vegetacijom sa privatnim pristupom moru i malom plažom.</p>
<p>Kuća ima tri spavaće sobe, dva kupatila, rustičnu dnevnu sobu sa kaminom i kuhinju sa trpezarijom. Kameni zidovi, drvena stolarija i terakota podovi stvaraju autentičnu mediteransku atmosferu.</p>
<p>Privatna plaža je na 100 metara — stepenice kroz vrt vas vode direktno do mora. Terasa sa roštiljem i pogledom na more, vrt sa smokvama i maslinama. Parking, Wi-Fi. Idealno za goste koji traže mir, privatnost i autentičan doživljaj.</p>`,

  'Apartman Rivijera': `<p>Elegantan apartman u blizini šetališta u Neumu sa pogledom na luku i more. Moderno opremljen u mediteranskom stilu, idealan za ljubitelje mora koji žele udoban smještaj uz plažu.</p>
<p>Apartman od 50m² sa dnevnom sobom, spavaćom sobom sa bračnim krevetom, potpuno opremljenom kuhinjom i kupatilom. Dekoracija u morskim tonovima plave i bijele sa mediteranskim detaljima. Balkon sa pogledom na more.</p>
<p>Šetalište i plaža su na 2 minute hoda — mogućnost iznajmljivanja čamaca i organizovanja izleta na otoke. Restorani sa svježom ribom u neposrednoj blizini. Parking, Wi-Fi, klima uređaj.</p>`,

  'Vila Mediteran': `<p>Luksuzna mediteranska vila sa bazenom, smještena na blagom brežuljku sa pogledom na more i otoke. Okružena vrtom sa mediteranskim biljem — lavandom, ružmarinom i maslinama.</p>
<p>Vila od 200m² sa pet spavaćih soba, četiri kupatila, prostranom dnevnom sobom sa kaminom, modernom kuhinjom i trpezarijom za 12 osoba. Svaka spavaća soba ima vlastiti balkon sa pogledom na more ili vrt.</p>
<p>Infinity bazen sa sun deckom, jacuzzi na terasi, ljetna kuhinja sa roštiljem, bocce teren u vrtu. Garaža za tri automobila, smart home sistem, klima uređaj. Do plaže 10 minuta šetnje. Idealna za veće grupe i proslave.</p>`,
}

try {
  const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)
  if (!connected) {
    logger.error('Failed to connect to the database')
    process.exit(1)
  }

  const properties = await Property.find({}).populate('location')

  logger.info(`Found ${properties.length} properties`)

  let updated = 0
  for (const property of properties) {
    const description = DESCRIPTIONS[property.name]

    if (!description) {
      logger.info(`No description template for "${property.name}" — skipping`)
      continue
    }

    property.description = description
    await property.save()
    updated++
    logger.info(`Updated description for "${property.name}" (${description.length} chars)`)
  }

  logger.info(`Done! Updated ${updated} of ${properties.length} properties.`)
  process.exit(0)
} catch (err) {
  logger.error('Seed descriptions error:', err)
  process.exit(1)
}
