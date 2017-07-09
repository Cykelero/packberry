import Serializer from './Serializer';

let rootSerializer = new Serializer('.');

rootSerializer.register(Object, {
	to: v => Object.keys(v).reduce((result, key) => {
		result[key] = Serializer.toSerializable(v[key]);
		return result;
	}, {}),
	from: s => Object.keys(s).reduce((result, key) => {
		result[key] = Serializer.fromSerializable(s[key]);
		return result;
	}, {})
});

rootSerializer.register(Array, {
	to: v => v.map(i => Serializer.toSerializable(i)),
	from: s => s.map(i => Serializer.fromSerializable(i))
});

export { Serializer as Serializer };
