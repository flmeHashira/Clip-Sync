const Schema = {
    name: "clipContent",
    properties: {
        _id: "uuid",
        type: "string",
        value: "string",
    },
    primaryKey: "_id",
};


const OpenRealmBehaviorConfiguration = {
    type: "openImmediately",
};


exports.Schema = Schema;
exports.OpenRealmBehaviorConfiguration = OpenRealmBehaviorConfiguration;