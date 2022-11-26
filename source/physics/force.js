export class Force
{
    constructor(name, force_vector, indefinite, duration = 0)
    {
        this.name = name; // string.
        this.force_vector = force_vector; // vec4 where force_vector[3] = 0.
        this.indefinite = indefinite; // bool.
        this.duration = duration; // float.
    }
}