import Serializer from './Serializer';

const rootSerializer = new Serializer('.');

rootSerializer.register(Object, {
	pack: v => Object.keys(v).reduce((result, key) => {
		result[key] = rootSerializer.toPacked(v[key]);
		return result;
	}, {}),
	unpack: p => Object.keys(p).reduce((result, key) => {
		result[key] = rootSerializer.fromPacked(p[key]);
		return result;
	}, {})
});

rootSerializer.register(Array, {
	pack: v => v.map(i => rootSerializer.toPacked(i)),
	unpack: p => p.map(i => rootSerializer.fromPacked(i))
});

export { Serializer as Serializer };
