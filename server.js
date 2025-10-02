import express from "express"
import bodyParser from "body-parser"
import { Seam } from "seam"

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(express.static("public"))

const seam = new Seam({ apiKey: "seam_8sRKUpeX_7uatm7jmHN2JSG8zSnPuBCWY" })
const acsSystemId = "a6f8f2b6-d086-4b7a-a926-f979aba3666c"
const accessGroupId = "bc68639e-62cc-4572-b087-f6e616800ab9"

// Opret bruger + credential og returnér PIN

app.post("/create-user", async (req, res) => {
  try {
    const { full_name, starts_at, ends_at } = req.body

    // Opret ACS-user med access schedule
    const acsUser = await seam.acs.users.create({
      full_name,
      acs_system_id: acsSystemId,
      access_schedule: { starts_at, ends_at }
    })
    console.log(`Opretter bruger ${acsUser.full_name}`)

    // Tilknyt access group
    await seam.acs.users.addToAccessGroup({
      acs_user_id: acsUser.acs_user_id,
      acs_access_group_id: accessGroupId
    })

    // Opret PIN-credential
    const credential = await seam.acs.credentials.create({
      acs_user_id: acsUser.acs_user_id,
      access_method: "code"
    })
    console.log(`Opretter pinkode til ${acsUser.full_name}`)

    // Vent op til 10 sekunder, indtil Salto KS genererer PIN
    let pin = null
    const startTime = Date.now()
    while (!pin && Date.now() - startTime < 10000) {
      const userCred = await seam.acs.credentials.get({ acs_credential_id: credential.acs_credential_id })
      if (userCred.code) pin = userCred.code
      else await new Promise(r => setTimeout(r, 1000))
    }

    res.json({
      user: acsUser,
      pin_code: pin
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kunne ikke oprette bruger" })
  }
})


// Blockere brugere

async function blockUnsubscribedUsers() {
  try {
    const users = await seam.acs.users.list({ acs_system_id: acsSystemId });

    for (const user of users) {
      // Tjek om brugeren er unsubscribed via warning
      const notSubscribedWarning = user.warnings?.find(
        w => w.warning_code === "salto_ks_user_not_subscribed"
      );

      // Kun blokere hvis ikke allerede suspended

      if (notSubscribedWarning) {
        if (user.is_suspended === false) {
            console.log(`Blokerer unsubscribed bruger: ${user.full_name}`);

        await seam.acs.users.suspend({
          acs_user_id: user.acs_user_id
        });

        console.log(`${user.full_name} er nu blokeret`);
        }
      }
    }
  } catch (err) {
    console.error("Fejl i funktion blockUnsubscribedUsers:", err);
  }
}

// Kør hvert 30. sekund
setInterval(blockUnsubscribedUsers, 30 * 1000);

app.listen(port, () => console.log(`server kører på http://localhost:${port}`))
