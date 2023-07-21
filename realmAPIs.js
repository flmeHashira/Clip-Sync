const Realm = require("realm")

const realmApp = new Realm.App({ id: "clip-sync-ehley" })

//config
const Schema = {
    name: "clipContent",
    properties: {
        owner_id: "string",
        _id: "uuid",
        type: "string",
        value: "string",
    },
    primaryKey: "_id",
}


const OpenRealmBehaviorConfiguration = {
    type: "openImmediately",
}

async function logOut()    {
    await realmApp.currentUser?.logOut()
}


async function RealmAuths(type, msg) {
    if (type == 0) {
        //type 0 is anonymous login
        //type 1 is email/password login
        // Create an anonymous credential
        const credentials = Realm.Credentials.anonymous()
        try {
            const user = await realmApp.logIn(credentials)
            console.log("Successfully logged in!", user.id)
            return user
        } catch (err) {
            console.error("Failed to log in", err.message)
        }
    }
    if (type == 1) {
        // Create an email/password credential
        const credentials = Realm.Credentials.emailPassword(
            msg.email,
            msg.password
        )
        try {
            const user = await realmApp.logIn(credentials)
            console.log("Successfully logged in!", msg.email)
            return user
        } catch (err) {
            console.error("Failed to log in", err.message)
            return null
        }
    }

}

async function registerUser(credentials)  {
    const email = credentials.email, password = credentials.password
    await realmApp.emailPasswordAuth.registerUser({ email, password })
}

async function openRealm(user) {
    const config = {
        path: "myrealm",
        schema: [Schema],
        sync: {
            user: user,
            flexible: true,
            newRealmFileBehavior: OpenRealmBehaviorConfiguration,
            existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
        },
    }
    return Realm.open(config)
}

async function addSubscription(realm, query) {
    await realm.subscriptions.update((mutableSubs) => {
        mutableSubs.add(query)
    })
}

async function clearDatabase(realm) {
    realm.write(() => {
        realm.delete(realm.objects("clipContent"))
    })
}

exports.registerUser = registerUser
exports.RealmAuths = RealmAuths
exports.openRealm = openRealm
exports.addSubscription = addSubscription
exports.clearDatabase = clearDatabase
exports.logOut = logOut