require('dotenv').config()
const Realm = require("realm");
const configs = require("./config");

const realmApp = new Realm.App({ id: "clip-sync-ehley" });


async function RealmAuths(type) {
    if (type == 0) {
        //type 0 is anonymous login
        //type 1 is email/password login
        // Create an anonymous credential
        const credentials = Realm.Credentials.anonymous();
        try {
            const user = await realmApp.logIn(credentials);
            console.log("Successfully logged in!", user.id);
            return user;
        } catch (err) {
            console.error("Failed to log in", err.message);
        }
    }
    if (type == 1) {
        // Create an email/password credential
        const credentials = Realm.Credentials.emailPassword(
            process.env.email,
            process.env.password
        );
        try {
            const user = await realmApp.logIn(credentials);
            console.log("Successfully logged in!", user.id);
            return user;
        } catch (err) {
            console.error("Failed to log in", err.message);
        }
    }

}

async function openRealm(user) {
    const config = {
        path: "myrealm",
        schema: [configs.Schema],
        deleteRealmIfMigrationNeeded: true,
        sync: {
            user: user,
            flexible: true,
            newRealmFileBehavior: configs.OpenRealmBehaviorConfiguration,
            existingRealmFileBehavior: configs.OpenRealmBehaviorConfiguration,
        },
    };
    return Realm.open(config);
}


async function addSubscription(realm, query) {
    await realm.subscriptions.update((mutableSubs) => {
        mutableSubs.add(query);
    });
}

async function clearDatabase(realm) {
    realm.write(() => {
        realm.delete(realm.objects("clipContent"));
    });
}


exports.RealmAuths = RealmAuths;
exports.openRealm = openRealm;
exports.addSubscription = addSubscription;
exports.clearDatabase = clearDatabase;