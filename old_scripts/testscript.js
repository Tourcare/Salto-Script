import { Seam } from "seam";

const seam = new Seam({ apiKey: "seam_8sRKUpeX_7uatm7jmHN2JSG8zSnPuBCWY" });
const acsSystemId = "a6f8f2b6-d086-4b7a-a926-f979aba3666c";
const accessGroupId = "bc68639e-62cc-4572-b087-f6e616800ab9";

(async () => {
  try {
    const users = await seam.acs.users.list({ acs_system_id: acsSystemId });
    console.log(`Fandt ${users.length} brugere`);

    for (const user of users) {
      const notSubscribedWarning = user.warnings?.find(
        w => w.warning_code === "salto_ks_user_not_subscribed"
      );

      if (notSubscribedWarning) {
        if (user.is_suspended === false) {
            console.log(`⚠️ ${user.full_name} er ikke subscribed`);
        }
      }
    }

  } catch (err) {
    console.error(err);
  }
})();

/*const userCred = await seam.acs.credentials.get({ 
    acs_credential_id: user[0].acs_credential_id 
});


 (async () => {
  try {
    // Dit ACS-system ID
    const acsSystemId = "a6f8f2b6-d086-4b7a-a926-f979aba3666c";

    // Din eksisterende Access Group (som dækker begge døre)
    const accessGroupId = "bc68639e-62cc-4572-b087-f6e616800ab9";

    // 1️⃣ Opret ACS-bruger
    const users = await seam.acs.users.list({acs_system_id: acsSystemId});

    for (const user of users) {
        console.log(user.full_name, user.is_managed);
    }

  } catch (err) {
    console.error("Noget gik galt:", err);
  }
})(); */