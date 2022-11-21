import {tiny} from './tiny-graphics.js';

const {vec3} = tiny;

export class Quat
{
    constructor(x, y, z, w)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

export function EulerToQuaternion(v) // roll (x), pitch (Y), yaw (z)
{
    // Abbreviations for the various angular functions
    let cr = Math.cos(v[0] * 0.5);
    let sr = Math.sin(v[0] * 0.5);
    let cp = Math.cos(v[1] * 0.5);
    let sp = Math.sin(v[1] * 0.5);
    let cy = Math.cos(v[2] * 0.5);
    let sy = Math.sin(v[2] * 0.5);

    let q = new Quat(0, 0, 0, 1);
    q.x = sr * cp * cy - cr * sp * sy;
    q.y = cr * sp * cy + sr * cp * sy;
    q.z = cr * cp * sy - sr * sp * cy;
    q.w = cr * cp * cy + sr * sp * sy;

    return q;
}

export function QuaternionToEuler(q)
{
    let angles = vec3(0, 0, 0);

    // Roll (x-axis rotation).
    let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    angles[0] = Math.atan2(sinr_cosp, cosr_cosp);

    // Pitch (y-axis rotation).
    let sinp = 2 * (q.w * q.y - q.z * q.x);
    // Use +/-90 degrees if out of range.
    if (sinp > 1)
    {
        angles[1] = Math.PI / 2;
    }
    else if (sinp < -1)
    {
        angles[1] = -Math.PI / 2;
    }
    else
    {
        angles[1] = Math.asin(sinp);
    }

    // Yaw (z-axis rotation).
    let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
    let cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
    angles[2] = Math.atan2(siny_cosp, cosy_cosp);

    return angles;
}
 
// Find axis of least significant component.
export function leastSignificantAxis(v)
{
    const absX = Math.abs(n[0]);
    const absY = Math.abs(n[1]);
    const absZ = Math.abs(n[2]);

    if (absX > absY)
    {
        if (absX > absZ)
        {
            return 0; // X > Y > Z, X > Z > Y
        }
        else
        {
            return 2; // Z > X > Y
        }
    }
    else
    {
        if (absY > absZ)
        {
            return 1; // Y > X > Z, Y > Z > X
        }
        else
        {
            return 2; // Z > Y > X
        }
    }
}