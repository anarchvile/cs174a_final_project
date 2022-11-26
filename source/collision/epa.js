import {support} from "./support.js";

// https://stackoverflow.com/questions/48979868/implementing-the-expanding-polytope-algorithm-in-3d-space
export class EPA
{
    solve(goi, goj, simplex) 
    {
        var simplex_faces = [{a: 0, b: 1, c: 2},
                            {a: 0, b: 1, c: 3},
                            {a: 0, b: 2, c: 3},
                            {a: 1, b: 2, c: 3}];
    
        let ret = null;
        while (true) 
        {
            let face = this.#find_closest_face(simplex, simplex_faces);

            if (face.norm == undefined)
            {
                break;
            }
            let point = support(goi, face.norm).minus(support(goj, face.norm.times(-1)));
            let dist = point.to3().dot(face.norm);

            if (dist - face.dist < 0.00001) 
            {
                ret = {axis: face.norm, dist: dist};
                break;
            }

            point[3] = 1;
            simplex.add(point);
            this.#reconstruct(simplex, simplex_faces, point);
        }
    
        return ret;
    }
    
    #reconstruct(simplex, simplex_faces, extend_point) 
    {
        let removalFaces = [];
        for (let i = 0; i < simplex_faces.length; ++i) 
        {
            let face = simplex_faces[i];
            let A = simplex.get_points()[face.a].to3();
            let B = simplex.get_points()[face.b].to3();
            let C = simplex.get_points()[face.c].to3();

            let AB = B.minus(A);
            let AC = C.minus(A);
            let norm = AB.cross(AC).normalized();

            let AO = A.times(-1);
            if (AO.dot(norm) > 0)
            {
                norm = norm.times(-1);
            }

            if (norm.dot(extend_point.minus(A)) > 0)
            {
                removalFaces.push(i);
            }
        }

        // Get the edges that are not shared between the faces that should be removed.
        let edges = [];
        for (let i = 0; i < removalFaces.length; ++i) 
        {
            let face = simplex_faces[removalFaces[i]];
            let edgeAB = {a: face.a, b: face.b};
            let edgeAC = {a: face.a, b: face.c};
            let edgeBC = {a: face.b, b: face.c};
    
            let k = this.#edge_in_edges(edges, edgeAB);
            if(k != -1)
            {
                edges.splice(k, 1);
            }
            else
            {
                edges.push(edgeAB);
            }
    
            k = this.#edge_in_edges(edges, edgeAC);
            if(k != -1)
            {
                edges.splice(k, 1);
            }
            else
            {
                edges.push(edgeAC);
            }
    
            k = this.#edge_in_edges(edges, edgeBC);
            if(k != -1)
            {
                edges.splice(k, 1);
            }
            else
            {
                edges.push(edgeBC);
            }
        }
    
        // Remove the faces from the polytope.
        for (let i = removalFaces.length - 1; i >= 0; --i) 
        {
            simplex_faces.splice(removalFaces[i], 1);
        }
    
        // Form new faces with the edges and new point.
        for(let i = 0; i < edges.length; ++i) 
        {
            simplex_faces.push({a: edges[i].a, b: edges[i].b, c: simplex.get_points().length - 1});
        }
    }
    
    #edge_in_edges(edges, edge) 
    {
        for(let i = 0; i < edges.length; ++i) 
        {
            if (edges[i].a == edge.a && edges[i].b == edge.b)
            {
                return i;
            }
        }
    
        return -1;
    }
    
    #find_closest_face(simplex, simplex_faces) 
    {
        let closest = {dist: Infinity};
        for (let i = 0; i < simplex_faces.length; ++i) 
        {
            let face = simplex_faces[i];
            let A = simplex.get_points()[face.a].to3();
            let B = simplex.get_points()[face.b].to3();
            let C = simplex.get_points()[face.c].to3();

            let AB = B.minus(A);
            let AC = C.minus(A);
            let norm = AB.cross(AC).normalized();

            let AO = A.times(-1);
            if (AO.dot(norm) > 0)
            {
                norm = norm.times(-1);
            }

            let dist = A.dot(norm);
            if (dist < closest.dist)
            {
                closest = {index: i, dist: dist, norm: norm, a: face.a, b: face.b, c: face.c};
            }
        }
    
        return closest;
    }
}