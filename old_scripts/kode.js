import { Seam } from "seam";

const seam = new Seam({ apiKey: "seam_8sRKUpeX_7uatm7jmHN2JSG8zSnPuBCWY" });

(async () => {
  try {
    // Dit ACS-system ID
    const acsSystemId = "a6f8f2b6-d086-4b7a-a926-f979aba3666c";

    // Din eksisterende Access Group (som dækker begge døre)
    const accessGroupId = "bc68639e-62cc-4572-b087-f6e616800ab9";

    // 1️⃣ Opret ACS-bruger
    const acsUser = await seam.acs.users.create({
      full_name: "Tourcare Gæst 123",
      acs_system_id: acsSystemId,
      access_schedule: {
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 7 * 60 * 1000).toISOString() // gyldig i 7 minutter
      }
    });

    console.log("Bruger oprettet:", acsUser);

    // 2️⃣ Tilføj bruger til access group
    await seam.acs.users.addToAccessGroup({
      acs_user_id: acsUser.acs_user_id,
      acs_access_group_id: accessGroupId
    });

    console.log("Bruger tilføjet til Access Group:", accessGroupId);

    // 3️⃣ Opret credential (PIN-kode)
    const credential = await seam.acs.credentials.create({
      acs_user_id: acsUser.acs_user_id,
      access_method: "code"
    });

    console.log("Credential oprettet, men koden er muligvis ikke klar endnu...");

    // 4️⃣ Vent et par sekunder for at lade Salto generere PIN-koden
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 sekunder

    // 5️⃣ Hent credential igen for at få PIN-koden
    const userCred = await seam.acs.credentials.get({
      acs_credential_id: credential.acs_credential_id
    });

    console.log("PIN-kode genereret af Salto KS:", userCred.code);

  } catch (err) {
    console.error("Noget gik galt:", err);
  }
})();
