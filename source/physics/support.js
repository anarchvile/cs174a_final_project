import {defs, tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, Vector3, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export function support(go, d)
{
    let highest = Number.MIN_VALUE;
    let support = vec4(0, 0, 0, 1); // Support is a point, so w = support[3] = 1.
    let dir = d;
    const c = go.get_collider_component();

    // TODO: Add general "convex polygon" type.
    if (c.type == "AABB")
    {
        const AABB_verts = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);

        for (let i = 0; i < AABB_verts.length; ++i) 
        {
            let v = AABB_verts[i];
            v = Mat4.scale(c.size[0], c.size[1], c.size[2]).times(v);
            //v = Mat4.rotation(0, 1, 0, 0).times(v); // TODO: Rotate object.
            const dot = v.dot(dir);
            if (dot > highest) 
            {
                highest = dot;
                support = v;
            }
        }
    }
    else if (c.type == "Sphere")
    {
        support = Mat4.scale(c.radius, c.radius, c.radius).times(dir.normalized());
    }
    
    support[3] = 1;
    support = Mat4.translation(go.position[0], go.position[1], go.position[2]).times(support);
    return support;
}