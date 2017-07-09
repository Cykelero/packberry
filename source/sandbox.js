import * as PackBerry from './index.js';

let serializer = new PackBerry.Serializer('packberry-sandbox');

(function() {
	class TestClass {
		constructor(someData) {
			this.someData = someData;
		}
	};

	serializer.register(TestClass, {
		fields: ['someData']
	});

	let testInstance = new TestClass('test-value'),
		serializedTestInstance = serializer.toRootSerializable(testInstance),
		deserializedTestInstance = serializer.fromRootSerializable(serializedTestInstance);

	console.log('# Serialized: ', serializedTestInstance);
	console.log('# Deserialized: :', deserializedTestInstance);
}())

let secondSerializer = new PackBerry.Serializer('packberry-sandbox-2');

let toSerializeWithFirstSerializer;

(function() {
	class TestClass {
		constructor(someData) {
			this.someData = someData;
		}
		
		specialGetter() {
			return this.someData;
		}
	};
	
	secondSerializer.register(TestClass, {
		fields: ['someData']
	});
	
	toSerializeWithFirstSerializer = new TestClass('test-value-2');
}())

let serializedTestInstance2 = serializer.toRootSerializable(toSerializeWithFirstSerializer),
	deserializedTestInstance2 = serializer.fromRootSerializable(serializedTestInstance2);

console.log('# X-Serialized: ', serializedTestInstance2);
console.log('# X-Deserialized: :', deserializedTestInstance2);
console.log(deserializedTestInstance2.specialGetter());

