import Register from './Register';

const SERIALIZATION_VERSION = 1;

export default class Serializer {
	constructor(name) {
		this.name = name;
		this._registeredMetadata = new Map();
		
		// Init
		if (/\//.test(this.name)) throw new Error('Serializer name cannot contain `/`');
		
		Register.add(this.name, this);
	}
	
	// Registration
	register(klass, metadata) {
		metadata.klass = klass;
		metadata.serializer = this;
		this._registeredMetadata.set(klass.name, metadata);
	}
	
	// Serialization/deserialization
	toJSON(value) {
		return JSON.stringify(this.toRootPacked(value));
	}
	
	fromJSON(serializedPayload) {
		return this.fromRootPacked(JSON.parse(serializedPayload));
	}
	
	toRootPacked(value) {
		return {
			version: SERIALIZATION_VERSION,
			data: this.toPacked(value)
		};
	}
	
	fromRootPacked(rootPacked) {
		return this.fromPacked(rootPacked.data);
	}
	
	toPacked(value) {
		if (typeof value === 'object') {
			// Object: needs conversion
			const metadata = this._getMetadataForClass(value.constructor);
			
			if (!metadata) {
				throw new Error(`${value.constructor.name} does not support serialization`);
			} else {
				return this._instanceToPacked(value, metadata);
			}
		} else {
			// Primitive type: no need to pack
			return value;
		}
	}
	
	fromPacked(packed) {
		if (typeof packed === 'object') {
			// Object: needs conversion
			const metadata = this._getMetadataForIdentifier(packed.classIdentifier);
			
			if (!metadata) {
				throw new Error(`Unknown class ${packed.classIdentifier} when deserializing`);
			} else {
				return this._instanceFromPacked(packed, metadata);
			}
		} else {
			// Primitive type: already usable
			return packed;
		}
	}
	
	_instanceToPacked(instance, metadata) {
		let result;
		
		if (metadata.fields) {
			result = {};
			metadata.fields.forEach(fieldName => {
				let fieldValue = instance[fieldName];
				
				const fieldFilter = metadata.filters && metadata.filters[fieldName];
				if (fieldFilter) {
					fieldValue = fieldFilter(fieldValue);
				}
				
				result[fieldName] = this.toPacked(fieldValue);
			});
		} else {
			result = metadata.pack(instance);
		}
		
		result = {
			classIdentifier: this._identifierFor(metadata),
			data: result
		};
		
		return result;
	}
	
	_instanceFromPacked(packed, metadata) {
		if (metadata.fields) {
			let fieldValues = {};
			metadata.fields.forEach(fieldName => {
				fieldValues[fieldName] = this.fromPacked(packed.data[fieldName]);
			});
			
			if (metadata.unpack) {
				return metadata.unpack(fieldValues);
			} else {
				const orderedFieldValues = metadata.fields.map(fieldName => fieldValues[fieldName]);
				return new metadata.klass(...orderedFieldValues);
			}
		} else {
			return metadata.unpack(packed.data);
		}
	}
	
	// Metadata lookup
	_getMetadataForClass(klass) {
		const localClassMetadata = this._getLocalMetadataForClass(klass);
		return localClassMetadata || Register.getMetadataForClass(klass);
	}
	
	_getMetadataForIdentifier(identifier) {
		const parts = identifier.split('/');
		
		if (parts[0] === this.name) {
			return this._getUnverifiedLocalMetadataForClassName(parts[1]);
		} else {
			return Register.getMetadataForIdentifier(identifier);
		}
	}
	
	_getLocalMetadataForClass(klass) {
		const metadata = this._getUnverifiedLocalMetadataForClassName(klass.name);
		return (metadata && metadata.klass === klass) ? metadata : null;
	}
	
	_getUnverifiedLocalMetadataForClassName(className) {
		return this._registeredMetadata.get(className);
	}
	
	_identifierFor(metadata) {
		return `${metadata.serializer.name}/${metadata.klass.name}`;
	}
};
