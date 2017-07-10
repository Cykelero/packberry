import Serializer from './Serializer';

const rootSerializer = new Serializer('.');

rootSerializer.register(Object, {
	pack: v => Object.keys(v).reduce((result, key) => {
		result[key] = Serializer.toPacked(v[key]);
		return result;
	}, {}),
	unpack: s => Object.keys(s).reduce((result, key) => {
		result[key] = Serializer.fromPacked(s[key]);
		return result;
	}, {})
});

rootSerializer.register(Array, {
	pack: v => v.map(i => Serializer.toPacked(i)),
	unpack: s => s.map(i => Serializer.fromPacked(i))
});

export { Serializer as Serializer };
