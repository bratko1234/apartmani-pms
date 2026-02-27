import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'
import env from '@/config/env.config'

const strings = new LocalizedStrings({
  fr: {
    TITLE: "Conditions d'utilisation",
    TOS: `
Bienvenue chez ${env.WEBSITE_NAME} ! En accédant à notre site Web et en utilisant nos services, vous acceptez de vous conformer et d'être lié par les conditions d'utilisation suivantes. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.

1. Acceptation des conditions

En accédant ou en utilisant nos services, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation et notre politique de confidentialité.

2. Utilisation de nos services

Vous acceptez d'utiliser nos services uniquement à des fins légales et d'une manière qui ne porte pas atteinte aux droits, ne restreint ni n'empêche quiconque d'utiliser nos services. Cela inclut le respect de toutes les lois et réglementations applicables.

3. Réservations et paiements

Lorsque vous effectuez une réservation avec ${env.WEBSITE_NAME}, vous acceptez de fournir des informations exactes et complètes. Tous les paiements doivent être effectués via notre système de paiement sécurisé. Une fois le paiement effectué, vous recevrez une confirmation de votre réservation.

4. Politique d'annulation

Les annulations effectuées 24 heures avant la date de location peuvent donner droit à un remboursement complet. Les annulations effectuées moins de 24 heures avant la date de location peuvent entraîner des frais d'annulation. Veuillez vous référer à notre politique d'annulation pour des informations détaillées.

5. Conditions de location

Toutes les locations sont soumises à nos conditions de location, qui incluent, sans s'y limiter, les restrictions d'âge et les obligations d'assurance. Vous êtes responsable de vous assurer que vous remplissez toutes les conditions avant d'effectuer une réservation.

6. Limitation de responsabilité

${env.WEBSITE_NAME} ne sera pas responsable des dommages indirects, accessoires ou consécutifs découlant de votre utilisation de nos services. En aucun cas, notre responsabilité totale ne dépassera le montant que vous avez payé pour les services.

7. Modifications des conditions

Nous nous réservons le droit de modifier ces conditions de service à tout moment. Toute modification entrera en vigueur immédiatement après sa publication sur notre site Web. Votre utilisation continue de nos services après toute modification constitue votre acceptation des nouvelles conditions.

8. Loi applicable

Ces conditions de service seront régies et interprétées conformément aux lois. Tout litige découlant de ces conditions sera résolu devant les tribunaux.

9. Coordonnées

Si vous avez des questions concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse ${env.CONTACT_EMAIL}. Nous sommes là pour vous aider pour toute demande relative à nos services.

10. Reconnaissance

En utilisant nos services, vous reconnaissez avoir lu et compris ces conditions d'utilisation et acceptez d'être lié par elles.    
    `,
  },
  en: {
    TITLE: 'Terms of Service',
    TOS: `
Welcome to ${env.WEBSITE_NAME}! By accessing our website and using our services, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use our services.


1. Acceptance of Terms

By accessing or using our services, you confirm that you have read, understood, and agree to these Terms of Service and our Privacy Policy.


2. Use of Our Services

You agree to use our services only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use of our services. This includes compliance with all applicable laws and regulations.


3. Reservations and Payments

When you make a reservation with ${env.WEBSITE_NAME}, you agree to provide accurate and complete information. All payments must be made through our secure payment system. Once payment is completed, you will receive a confirmation of your reservation.


4. Cancellation Policy

Cancellations made 24 hours before the rental date may be eligible for a full refund. Cancellations made less than 24 hours prior to the rental date may incur a cancellation fee. Please refer to our cancellation policy for detailed information.


5. Rental Conditions

All rentals are subject to our rental conditions, which include but are not limited to age restrictions and insurance obligations. You are responsible for ensuring that you meet all requirements before making a reservation.


6. Limitation of Liability

${env.WEBSITE_NAME} shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our services. In no event shall our total liability exceed the amount paid by you for the services.


7. Modifications to Terms

We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on our website. Your continued use of our services following any changes constitutes your acceptance of the new terms.


8. Governing Law

These Terms of Service shall be governed by and construed in accordance with the laws. Any disputes arising out of these terms shall be resolved in the courts.


9. Contact Information

If you have any questions regarding these Terms of Service, please contact us at ${env.CONTACT_EMAIL}. We are here to help you with any inquiries related to our services.


10. Acknowledgment

By using our services, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
    `,
  },
  sr: {
    TITLE: 'Uslovi korištenja',
    TOS: `
Dobrodošli u ${env.WEBSITE_NAME}! Pristupanjem našoj web stranici i korištenjem naših usluga, pristajete da se pridržavate i da budete obavezani sljedećim uslovima korištenja. Ako ne prihvatate ove uslove, molimo nemojte koristiti naše usluge.

1. Prihvatanje uslova

Pristupanjem ili korištenjem naših usluga, potvrđujete da ste pročitali, razumjeli i prihvatili ove Uslove korištenja i našu Politiku privatnosti.

2. Korištenje naših usluga

Pristajete da koristite naše usluge samo u zakonite svrhe i na način koji ne krši prava, ne ograničava niti sprečava bilo koga drugog u korištenju naših usluga. To uključuje poštovanje svih važećih zakona i propisa.

3. Rezervacije i plaćanja

Kada izvršite rezervaciju putem ${env.WEBSITE_NAME}, pristajete da pružite tačne i potpune informacije. Sva plaćanja moraju biti izvršena putem našeg sigurnog sistema plaćanja. Nakon izvršenog plaćanja, dobićete potvrdu vaše rezervacije.

4. Politika otkazivanja

Otkazivanja izvršena 24 sata prije datuma iznajmljivanja mogu imati pravo na potpuni povrat sredstava. Otkazivanja izvršena manje od 24 sata prije datuma iznajmljivanja mogu rezultirati naplatom naknade za otkazivanje. Molimo pogledajte našu politiku otkazivanja za detaljne informacije.

5. Uslovi iznajmljivanja

Sva iznajmljivanja podliježu našim uslovima iznajmljivanja, koji uključuju, ali nisu ograničeni na starosna ograničenja i obaveze osiguranja. Vi ste odgovorni da osigurate da ispunjavate sve uslove prije izvršenja rezervacije.

6. Ograničenje odgovornosti

${env.WEBSITE_NAME} neće biti odgovoran za bilo kakvu indirektnu, slučajnu ili posljedičnu štetu koja proizlazi iz vašeg korištenja naših usluga. Ni u kom slučaju naša ukupna odgovornost neće premašiti iznos koji ste platili za usluge.

7. Izmjene uslova

Zadržavamo pravo izmjene ovih Uslova korištenja u bilo kom trenutku. Sve promjene stupaju na snagu odmah nakon objavljivanja na našoj web stranici. Vaše nastavljeno korištenje naših usluga nakon bilo kakvih promjena predstavlja vaše prihvatanje novih uslova.

8. Mjerodavno pravo

Ovi Uslovi korištenja biće regulisani i tumačeni u skladu sa zakonima. Svi sporovi koji proizlaze iz ovih uslova biće rješavani pred nadležnim sudovima.

9. Kontakt informacije

Ako imate bilo kakva pitanja u vezi sa ovim Uslovima korištenja, molimo kontaktirajte nas na ${env.CONTACT_EMAIL}. Tu smo da vam pomognemo sa svim upitima vezanim za naše usluge.

10. Priznanje

Korištenjem naših usluga, potvrđujete da ste pročitali i razumjeli ove Uslove korištenja i pristajete da budete obavezani njima.
    `,
  },
})

langHelper.setLanguage(strings)
export { strings }
