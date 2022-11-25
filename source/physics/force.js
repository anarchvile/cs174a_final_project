export class Force
{
    constructor(name, force_vector, indefinite, duration = 0)
    {
        this.name = name;
        this.force_vector = force_vector;
        this.indefinite = indefinite;
        this.duration = duration;
    }
}