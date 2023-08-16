# User Guide 📚

#### Create Realm App:
1. Create new MongoDB cloud database if not having one already [](https://www.mongodb.com/basics/create-database#:~:text=Table%20of%20Contents-,Using%20the%20MongoDB%20Atlas%20UI,-Using%20the%20MongoDB)
2. Create a new App from App Services UI [](https://www.mongodb.com/docs/atlas/app-services/apps/create/#create-an-app)

### Setup App and device sync:
Insert your app id obtained [here](https://www.mongodb.com/docs/atlas/app-services/apps/metadata/#std-label-find-your-app-id) in place of `<yourAppId>`  in RealmAPIs.

```js
const realmApp = new Realm.App({ id: "<yourAppId>" })
```

1. Add Schema:
	Copy paste the following schema in the `Schema` tab under `DATA ACCESS` section in [App Services](https://realm.mongodb.com)
	```json
	  "title": "clipContent",
	  "bsonType": "object",
	  "required": [
	    "owner_id",
	    "_id",
	    "type",
	    "value"
	  ],
	  "properties": {
	    "owner_id": {
	      "bsonType": "string"
	    },
	    "_id": {
	      "bsonType": "uuid"
	    },
	    "type": {
	      "bsonType": "string"
	    },
	    "value": {
	      "bsonType": "string"

	    }
	  }
	}
	````
2. add preset `readOwnWriteOwn` [rule](https://realm.mongodb.com) to the database
3. Enable Device Sync:
	1. Turn on Device Sync with partition selected as `Flexible`
	2. Add the followings in Configure Queryable field: `_id`, `type`, `owner_id`
	   
![Sync _ App Services (1)](https://github.com/flmeHashira/checl/assets/108903054/9b0f4176-1c24-455c-9d7b-c9d7e63bd72d)

### You're all set! 🎉