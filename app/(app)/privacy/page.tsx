import styles from "@/app/(app)/legal.module.css";

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Privacy Policy / Politica de Confidențialitate</h1>
        <p className={styles.body}>Last updated: 4.02.2026</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.section}>RO</p>
          <p className={styles.body}>
            LIVADAI (&quot;noi&quot;, &quot;al nostru&quot;) respectă confidențialitatea ta și se angajează să îți
            protejeze datele personale.
          </p>
          <p className={styles.body}>
            Această Politică de Confidențialitate explică modul în care colectăm, folosim, divulgăm și protejăm
            informațiile tale atunci când folosești aplicația mobilă și website-ul LIVADAI (împreună, &quot;Platforma&quot;).
          </p>
          <p className={styles.body}>
            Prin utilizarea LIVADAI, ești de acord cu practicile descrise în această Politică de Confidențialitate.
          </p>

          <p className={styles.section}>1. Cine suntem</p>
          <p className={styles.body}>
            LIVADAI este o piață digitală care conectează persoane (&quot;Exploratori&quot;) cu gazde locale (&quot;Gazde&quot;)
            care creează și oferă experiențe reale.
          </p>
          <p className={styles.body}>
            LIVADAI acționează ca platformă intermediară și nu oferă direct experiențe.
          </p>
          <p className={styles.body}>
            Pentru întrebări legate de această Politică de Confidențialitate, ne poți contacta la:
          </p>
          <p className={styles.body}>
            📧{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>2. Informațiile pe care le colectăm</p>
          <p className={styles.body}>
            Colectăm doar informațiile necesare pentru a opera Platforma în siguranță și eficient.
          </p>
          <p className={styles.section}>2.1 Informații furnizate direct</p>
          <p className={styles.body}>Când îți creezi un cont sau folosești Platforma, putem colecta:</p>
          <p className={styles.body}>• Adresa de email</p>
          <p className={styles.body}>• Numărul de telefon</p>
          <p className={styles.body}>• Numele complet (dacă este furnizat)</p>
          <p className={styles.body}>• Rolul contului (Explorer sau Gazdă)</p>
          <p className={styles.body}>• Informații de profil pe care alegi să le adaugi</p>
          <p className={styles.body}>• Conținutul trimis (descrieri, mesaje, recenzii)</p>

          <p className={styles.section}>2.2 Date de rezervare și tranzacție</p>
          <p className={styles.body}>Când faci sau primești o rezervare:</p>
          <p className={styles.body}>• Detalii de rezervare (data, locația, numărul de participanți)</p>
          <p className={styles.body}>• Status tranzacție (plătit, confirmat, finalizat)</p>
          <p className={styles.body}>• Informații pentru payout pentru Gazde (gestionate prin Stripe)</p>
          <p className={styles.body}>⚠️ Nu stocăm detalii de card.</p>
          <p className={styles.body}>Toate plățile sunt procesate în siguranță de Stripe.</p>

          <p className={styles.section}>2.3 Comunicări</p>
          <p className={styles.body}>Colectăm mesajele trimise prin Platformă strict pentru:</p>
          <p className={styles.body}>• Comunicarea între Gazde și Exploratori</p>
          <p className={styles.body}>• Prevenirea fraudei sau abuzului</p>
          <p className={styles.body}>• Oferirea de suport</p>

          <p className={styles.section}>3. Cum folosim datele tale</p>
          <p className={styles.body}>Folosim datele personale doar în scopuri legitime, inclusiv:</p>
          <p className={styles.body}>• Crearea și administrarea conturilor</p>
          <p className={styles.body}>• Facilitarea rezervărilor și participării la experiențe</p>
          <p className={styles.body}>• Procesarea plăților și payout-urilor</p>
          <p className={styles.body}>• Trimiterea de emailuri tranzacționale (coduri, confirmări)</p>
          <p className={styles.body}>• Oferirea de suport</p>
          <p className={styles.body}>• Securitatea platformei și prevenirea fraudei</p>
          <p className={styles.body}>• Îmbunătățirea funcționalității și experienței</p>
          <p className={styles.body}>❌ Nu vindem date personale.</p>
          <p className={styles.body}>❌ Nu folosim datele pentru publicitate terță.</p>

          <p className={styles.section}>4. Temei legal (GDPR)</p>
          <p className={styles.body}>Procesăm datele tale în baza următoarelor temeiuri:</p>
          <p className={styles.body}>• Necesitate contractuală – pentru furnizarea serviciilor Platformei</p>
          <p className={styles.body}>• Obligație legală – contabilitate, taxe, conformitate</p>
          <p className={styles.body}>• Interes legitim – securitate, prevenirea fraudei, îmbunătățiri</p>
          <p className={styles.body}>• Consimțământ – unde este necesar</p>

          <p className={styles.section}>5. Plăți și servicii terțe</p>
          <p className={styles.section}>5.1 Stripe</p>
          <p className={styles.body}>Plățile și payout-urile sunt gestionate de Stripe.</p>
          <p className={styles.body}>
            Stripe poate colecta și procesa date personale și financiare conform politicii sale de confidențialitate.
          </p>
          <p className={styles.body}>LIVADAI nu are acces la:</p>
          <p className={styles.body}>• Numere complete de card</p>
          <p className={styles.body}>• Credenziale bancare</p>
          <p className={styles.body}>• Date sensibile de autentificare pentru plăți</p>

          <p className={styles.section}>5.2 Alți furnizori</p>
          <p className={styles.body}>Putem folosi servicii terțe pentru:</p>
          <p className={styles.body}>• Trimitere email</p>
          <p className={styles.body}>• Hosting și infrastructură</p>
          <p className={styles.body}>• Analytics (date agregate, neidentificabile)</p>
          <p className={styles.body}>Toți furnizorii sunt obligați contractual să protejeze datele.</p>

          <p className={styles.section}>6. Păstrarea datelor</p>
          <p className={styles.body}>Păstrăm datele tale personale:</p>
          <p className={styles.body}>• Cât timp contul este activ</p>
          <p className={styles.body}>• Conform cerințelor legale</p>
          <p className={styles.body}>• Pentru soluționarea disputelor sau aplicarea acordurilor</p>
          <p className={styles.body}>Poți solicita ștergerea contului oricând (vezi Secțiunea 9).</p>

          <p className={styles.section}>7. Securitatea datelor</p>
          <p className={styles.body}>Implementăm măsuri tehnice și organizaționale adecvate, inclusiv:</p>
          <p className={styles.body}>• Comunicare criptată (HTTPS/TLS)</p>
          <p className={styles.body}>• Control acces și permisiuni pe roluri</p>
          <p className={styles.body}>• Mecanisme de autentificare securizate</p>
          <p className={styles.body}>
            Totuși, niciun sistem nu este 100% sigur. Utilizatorii sunt responsabili să își păstreze confidențiale
            credențialele de login.
          </p>

          <p className={styles.section}>8. Confidențialitatea copiilor</p>
          <p className={styles.body}>LIVADAI nu este destinat persoanelor sub 18 ani.</p>
          <p className={styles.body}>Nu colectăm intenționat date personale de la minori.</p>
          <p className={styles.body}>
            Dacă aflăm că astfel de date au fost colectate, le vom șterge imediat.
          </p>

          <p className={styles.section}>9. Drepturile tale (GDPR)</p>
          <p className={styles.body}>Ai dreptul să:</p>
          <p className={styles.body}>• Accesezi datele tale personale</p>
          <p className={styles.body}>• Corectezi datele incorecte/incomplete</p>
          <p className={styles.body}>• Soliciți ștergerea datelor</p>
          <p className={styles.body}>• Restricționezi sau te opui prelucrării</p>
          <p className={styles.body}>• Obții portabilitatea datelor</p>
          <p className={styles.body}>• Retragi consimțământul oricând</p>
          <p className={styles.body}>
            Pentru exercitarea drepturilor, contactează-ne la:
          </p>
          <p className={styles.body}>
            📧{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>10. Transferuri internaționale</p>
          <p className={styles.body}>
            Datele tale pot fi procesate pe servere din UE sau alte jurisdicții cu garanții adecvate de protecție a
            datelor, în conformitate cu GDPR.
          </p>

          <p className={styles.section}>11. Modificări ale politicii</p>
          <p className={styles.body}>
            Putem actualiza această Politică periodic. Orice schimbări vor fi publicate aici, iar data &quot;Last updated&quot;
            va fi revizuită. Continuarea utilizării Platformei constituie acceptarea actualizărilor.
          </p>

          <p className={styles.section}>12. Contact</p>
          <p className={styles.body}>Pentru întrebări sau nelămuriri, contactează-ne la:</p>
          <p className={styles.body}>
            📧{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>EN</p>
          <p className={styles.body}>
            LIVADAI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is committed to protecting your personal data.
          </p>
          <p className={styles.body}>
            This Privacy Policy explains how we collect, use, disclose, and protect your information when you use the
            LIVADAI mobile application and website (collectively, the &quot;Platform&quot;).
          </p>
          <p className={styles.body}>
            By using LIVADAI, you agree to the practices described in this Privacy Policy.
          </p>

          <p className={styles.section}>1. Who We Are</p>
          <p className={styles.body}>
            LIVADAI is a digital marketplace that connects people (&quot;Explorers&quot;) with local hosts (&quot;Hosts&quot;) who create
            and offer real-life experiences.
          </p>
          <p className={styles.body}>
            LIVADAI acts as an intermediary platform and does not directly provide experiences.
          </p>
          <p className={styles.body}>For any questions regarding this Privacy Policy, you can contact us at:</p>
          <p className={styles.body}>
            📧{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>2. Information We Collect</p>
          <p className={styles.body}>
            We collect only the information necessary to operate the Platform safely and effectively.
          </p>
          <p className={styles.section}>2.1 Information You Provide Directly</p>
          <p className={styles.body}>When you create an account or use the Platform, we may collect:</p>
          <p className={styles.body}>• Email address</p>
          <p className={styles.body}>• Phone number</p>
          <p className={styles.body}>• Full name (if provided)</p>
          <p className={styles.body}>• Account role (Explorer or Host)</p>
          <p className={styles.body}>• Profile information you choose to add</p>
          <p className={styles.body}>• Content you submit (experience descriptions, messages, reviews)</p>

          <p className={styles.section}>2.2 Booking & Transaction Data</p>
          <p className={styles.body}>When you make or receive a booking:</p>
          <p className={styles.body}>• Booking details (date, location, number of participants)</p>
          <p className={styles.body}>• Transaction status (paid, confirmed, completed)</p>
          <p className={styles.body}>• Payout-related information for Hosts (handled via Stripe)</p>
          <p className={styles.body}>⚠️ We do NOT store credit card details.</p>
          <p className={styles.body}>All payments are processed securely by Stripe.</p>

          <p className={styles.section}>2.3 Communications</p>
          <p className={styles.body}>We collect messages sent through the Platform, strictly to:</p>
          <p className={styles.body}>• Enable communication between Hosts and Explorers</p>
          <p className={styles.body}>• Prevent fraud or abuse</p>
          <p className={styles.body}>• Provide customer support</p>

          <p className={styles.section}>3. How We Use Your Data</p>
          <p className={styles.body}>We use your personal data only for legitimate business purposes, including:</p>
          <p className={styles.body}>• Creating and managing user accounts</p>
          <p className={styles.body}>• Enabling bookings and participation in experiences</p>
          <p className={styles.body}>• Processing payments and payouts</p>
          <p className={styles.body}>• Sending transactional emails (verification codes, booking confirmations)</p>
          <p className={styles.body}>• Providing customer support</p>
          <p className={styles.body}>• Ensuring platform security and preventing fraud</p>
          <p className={styles.body}>• Improving the Platform’s functionality and user experience</p>
          <p className={styles.body}>❌ We do NOT sell personal data.</p>
          <p className={styles.body}>❌ We do NOT use your data for third-party advertising.</p>

          <p className={styles.section}>4. Legal Basis for Processing (GDPR)</p>
          <p className={styles.body}>We process your data under the following legal bases:</p>
          <p className={styles.body}>• Contractual necessity – to provide Platform services</p>
          <p className={styles.body}>• Legal obligation – accounting, tax, and compliance requirements</p>
          <p className={styles.body}>• Legitimate interest – security, fraud prevention, platform improvement</p>
          <p className={styles.body}>• Consent – where required (e.g. optional communications)</p>

          <p className={styles.section}>5. Payments & Third-Party Services</p>
          <p className={styles.section}>5.1 Stripe</p>
          <p className={styles.body}>Payments and payouts are handled by Stripe, a third-party payment processor.</p>
          <p className={styles.body}>
            Stripe may collect and process personal and financial data according to its own Privacy Policy.
          </p>
          <p className={styles.body}>LIVADAI never has access to:</p>
          <p className={styles.body}>• Full card numbers</p>
          <p className={styles.body}>• Bank account credentials</p>
          <p className={styles.body}>• Sensitive payment authentication data</p>

          <p className={styles.section}>5.2 Other Service Providers</p>
          <p className={styles.body}>We may use trusted third-party services for:</p>
          <p className={styles.body}>• Email delivery</p>
          <p className={styles.body}>• Hosting and infrastructure</p>
          <p className={styles.body}>• Analytics (non-identifying, aggregated data only)</p>
          <p className={styles.body}>All providers are contractually obligated to protect your data.</p>

          <p className={styles.section}>6. Data Retention</p>
          <p className={styles.body}>We retain your personal data:</p>
          <p className={styles.body}>• As long as your account is active</p>
          <p className={styles.body}>• As required by law (e.g. accounting records)</p>
          <p className={styles.body}>• As necessary to resolve disputes or enforce agreements</p>
          <p className={styles.body}>You may request account deletion at any time (see Section 9).</p>

          <p className={styles.section}>7. Data Security</p>
          <p className={styles.body}>We implement appropriate technical and organizational security measures, including:</p>
          <p className={styles.body}>• Encrypted communication (HTTPS/TLS)</p>
          <p className={styles.body}>• Access control and role-based permissions</p>
          <p className={styles.body}>• Secure authentication mechanisms</p>
          <p className={styles.body}>
            However, no system is 100% secure. Users are responsible for keeping their login credentials confidential.
          </p>

          <p className={styles.section}>8. Children’s Privacy</p>
          <p className={styles.body}>LIVADAI is not intended for children under the age of 18.</p>
          <p className={styles.body}>We do not knowingly collect personal data from minors.</p>
          <p className={styles.body}>
            If we become aware that such data has been collected, it will be deleted immediately.
          </p>

          <p className={styles.section}>9. Your Rights (GDPR)</p>
          <p className={styles.body}>You have the right to:</p>
          <p className={styles.body}>• Access your personal data</p>
          <p className={styles.body}>• Correct inaccurate or incomplete data</p>
          <p className={styles.body}>• Request deletion of your data</p>
          <p className={styles.body}>• Restrict or object to processing</p>
          <p className={styles.body}>• Data portability</p>
          <p className={styles.body}>• Withdraw consent at any time</p>
          <p className={styles.body}>To exercise these rights, contact us at:</p>
          <p className={styles.body}>
            📧{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>10. International Data Transfers</p>
          <p className={styles.body}>
            Your data may be processed on servers located within the EU or other jurisdictions with adequate data
            protection safeguards, in compliance with GDPR requirements.
          </p>

          <p className={styles.section}>11. Changes to This Privacy Policy</p>
          <p className={styles.body}>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the &quot;Last
            updated&quot; date will be revised. Continued use of the Platform after changes constitutes acceptance of the
            updated policy.
          </p>

          <p className={styles.section}>12. Contact Us</p>
          <p className={styles.body}>
            If you have any questions or concerns about this Privacy Policy or how your data is handled, contact us at:
          </p>
          <p className={styles.body}>
            📧{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
