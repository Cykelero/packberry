import Serializer from './Serializer';

const rootSerializer = new Serializer('.');

rootSerializer.register(Object, {
	pack: v => Object.keys(v).reduce((result, key) => {
		result[key] = Serializer.toPacked(v[key]);
		return result;
	}, {}),
	unpack: p => Object.keys(p).reduce((result, key) => {
		result[key] = Serializer.fromPacked(p[key]);
		return result;
	}, {})
});

rootSerializer.register(Array, {
	pack: v => v.map(i => Serializer.toPacked(i)),
	unpack: p => p.map(i => Serializer.fromPacked(i))
});

export { Serializer as Serializer };
