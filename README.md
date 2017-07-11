# PackBerry

`JSON.stringify()` and `JSON.parse()` works just fine for serializing straightforward data, but what about class instances?

PackBerry lets you declare what's special about your classes, so that you can serialize and deserialize them:

````js
// Make an instance
let theIncredibles = new Movie('The Incredibles', 2004);
console.log(theIncredibles.getCentury()); // `21`

// Serialize it…
let serializedIncredibles = serializer.toJSON(theIncredibles);

// Deserialize it…
let unpackedIncredibles = serializer.fromJSON(serializedIncredibles);

// It still works!
console.log(unpackedIncredibles instanceof Movie); // `true`
console.log(unpackedIncredibles.getCentury()); // `21`

````

## Usage

After installing PackBerry with `npm install packberry`, import it in your code and get your very own serializer:

````js
import { Serializer } from pacbkberry;
let serializer = new Serializer('my-app-namespace');
````

(The namespace will be used in the serialized data, to distinguish your app's classes from your possible dependencies' classes.)

Then register your classes with your serializer:

````js
class Movie {
	constructor(name, year) {
		this.name = name;
		this.year = year;
	}
	
	getCentury() {
		return Math.floor((this.year - 1) / 100) + 1;
	}
}

serializer.register(Movie, {
	fields: ['name', 'year']
});
````

And tada! Your class is (un)packable:

````js
let serializedAmelie = serializer.toJSON(new Movie('Amélie', 2001));
````

## register()

The `register()` method accepts various options, to mix and match depending on the complexity of your classes.

### fields

With just a `fields` parameter, PackBerry will pack the listed fields, and then use them in order to call your constructor when unpacking:

````js
serializer.register(Movie, {
	fields: ['name', 'year']
});

// means that when unpacking, PackBerry will call `new Movie(name, year)`
````

### filters

If some of your data needs to be transformed before packing, declare a filter:

````js
// This makes sure the year is packed as an integer
serializer.register(Movie, {
	fields: ['name', 'year'],
	filters: {
		year: v => parseInt(v)
	}
});
````

### unpack

If your constructor can't simply be called with the packed parameters, you can tell PackBerry how to make instances using `unpack`:

````js
serializer.register(Movie, {
	fields: ['name', 'year'],
	unpack: packed => new Movie(packed.name, packed.year)
});
````

### pack

If you can't list all the fields in advance, use `pack` instead of `fields` (and `filters`), and do the packing yourself. The returned value must be readily JSON-serializable.

````js
serializer.register(Movie, {
	pack: value => {
		return {
			name: value.name,
			year: value.year
		};
	},
	unpack: packed => new Movie(packed.name, packed.year)
});
````

When you do this, you'll want to use `Serializer.toPacked(value)` to pack any instance your class contains.  
You can't use `pack` without specifying `unpack` as well.

## Caveats

They could be resolved without dramatically overhauling PackBerry, but as of today these limitations apply:

- To identify a class, PackBerry relies on its `name`. This might break if you minify your code.
- PackBerry doesn't understand inheritance right now. You'll have to register each subclass separately.
- PackBerry includes class identifiers in the packed data, to know which class to instantiate when unpacking; this is quite verbose.
- Some native JavaScript classes (such as `RegExp`, `Map`, `Set`, and `Int8Array`) don't currently have built-in PackBerry support.

## Development

Clone PackBerry and run `npm install`.

You can then **build** the release version using `npm run build`, and run the **sandbox**, a handy testbed, using `npm run sandbox`.
