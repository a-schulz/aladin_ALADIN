export class GrGenModel {
	constructor(private nodeClasses: Array<GrGenNode>, private edgeClasses: Array<GrGenEdge>) {}

	public writeModel() {
		const nodeClassesString = this.nodeClasses.map((nodeClass) => nodeClass.writeEntity()).join("\n");
		const edgeClassesString = this.edgeClasses.map((edgeClass) => edgeClass.writeEntity()).join("\n");

		return `${nodeClassesString}\n${edgeClassesString}`;
	}
}

export enum GrGenEntityAttributeType {
	STRING = "string",
	INT = "int",
	FLOAT = "float",
	DOUBLE = "double",
	BOOL = "bool",
}
export interface GrGenEntityAttributes {
	[key: string]: GrGenEntityAttributeType;
}
export interface GrGenEntity {
	name: string;
	isAbstract: boolean;
	inheritedEntities: Array<string>;
	entityAttributes: GrGenEntityAttributes;
}
export class GrGenEntity implements GrGenEntity {
	protected entityType: string;
	constructor(
		public name: string,
		public isAbstract: boolean = false,
		public entityAttributes: GrGenEntityAttributes = {},
		public inheritedEntities: Array<string> = []
	) {}

	public writeEntity(): string {
		const { abstractModifierString, classIdentifierString, inheritedEntitiesString, entityAttributesString } =
			this.constructEntityStrings();

		return `${abstractModifierString}${this.entityType} ${classIdentifierString}${inheritedEntitiesString}${entityAttributesString};`;
	}

	protected constructEntityStrings(): { [key: string]: string } {
		const abstractModifierString = this.writeAbstractModifier();
		const classIdentifierString = `class ${this.name}`;
		const inheritedEntitiesString = this.writeInheritedEntities();
		const entityAttributesString = this.writeEntityAttributes();

		return { abstractModifierString, classIdentifierString, inheritedEntitiesString, entityAttributesString };
	}

	protected writeAbstractModifier(): string {
		if (this.isAbstract) {
			return "abstract ";
		}
		return "";
	}
	protected writeInheritedEntities(): string {
		if (this.inheritedEntities.length) {
			const joinedEntities = this.inheritedEntities.join(", ");
			return ` extends ${joinedEntities}`;
		}
		return "";
	}
	protected writeEntityAttributes(): string {
		if (Object.keys(this.entityAttributes).length) {
			const entityAttributes = Object.entries(this.entityAttributes).reduce(
				(attributes, [attributeName, attributeType]) => {
					attributes += `\t${attributeName}: ${attributeType};\n`;
					return attributes;
				},
				""
			);
			return ` {\n${entityAttributes}}`;
		}
		return "";
	}
}

export class GrGenNode extends GrGenEntity {
	protected entityType: string = "node";
	constructor(
		public name: string,
		public isAbstract: boolean = false,
		public entityAttributes: GrGenEntityAttributes = {},
		public inheritedEntities: Array<string> = []
	) {
		super(name, isAbstract, entityAttributes, inheritedEntities);
	}
}

export enum GrGenEdgeType {
	ARBITRARY = "arbitrary",
	DIRECTED = "directed",
	UNDIRECTED = "undirected",
}
export class GrGenEdge extends GrGenEntity {
	protected entityType: string = "edge";
	constructor(
		public name: string,
		public edgeType: GrGenEdgeType = GrGenEdgeType.DIRECTED,
		public isAbstract: boolean = false,
		public entityAttributes: GrGenEntityAttributes = {},
		public inheritedEntities: Array<string> = []
	) {
		super(name, isAbstract, entityAttributes, inheritedEntities);
	}

	public writeEntity(): string {
		const { abstractModifierString, classIdentifierString, inheritedEntitiesString, entityAttributesString } =
			this.constructEntityStrings();

		return `${abstractModifierString}${this.edgeType} ${this.entityType} ${classIdentifierString}${inheritedEntitiesString}${entityAttributesString};`;
	}
}
