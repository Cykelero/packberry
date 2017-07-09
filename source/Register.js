let Register = {
	_serializers: new Map(),
	
	add(name, serializer) {
		this._serializers.set(name, serializer);
	},
	
	get(name) {
		return this._serializers.get(name);
	},
	
	getMetadataForClass(klass) {
		for (let pair of this._serializers) {
			let metadata = pair[1]._getLocalMetadataForClass(klass);
			if (metadata) return metadata;
		}
		return null;
	},
	
	getMetadataForIdentifier(identifier) {
		let parts = identifier.split('/'),
			serializer = this.get(parts[0]);
		
		return serializer._getUnverifiedLocalMetadataForClassName(parts[1]);
	}
};

export default Register;
