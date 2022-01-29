import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshReflectorMaterial, Image } from "@react-three/drei";
import "./styles.css";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import getUuidByString from "uuid-by-string";
export default function App({ images }) {

    return (
        <Canvas dpr={window.devicePixelRatio} camera={{fov: 70, position: [0, 5, 10]}}>
            <color attach="background" args={["#191920"]}/>
            <fog attach="fog" args={["#9f9f9f", 0, 20]}/>
            <Environment preset="city"/> 
            <group position={[0, -1, 0]}>
                <Frames images={images}/>
                <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
                    <planeGeometry args={[50, 50]}/>
                    <MeshReflectorMaterial 
                        color="#151515"
                        roughness={0}
                        metalness={0}
                    />
                </mesh>
            </group>
        </Canvas>
    )
} 


function Frames ({images, p = new THREE.Vector3(), q = new THREE.Quaternion()} ) {

    const ref = React.useRef(null);
    const clicked = React.useRef(null);
    const [,params] = useRoute("/item/:id");
    const [,setLocation] = useLocation();

    React.useEffect(()=> {
        clicked.current = ref.current.getObjectByName(params?.id);
        if (clicked.current) {
            clicked.current.parent.updateWorldMatrix(true, true);
            clicked.current.parent.localToWorld(p.set(0, 1.3, 2));
            clicked.current.parent.getWorldQuaternion(q);
        }else {
            p.set(0, 0, 5);
            q.identity();
        }
    })

    useFrame((state, dt)=> {
        state.camera.position.lerp(p, THREE.MathUtils.damp(0, 1, 3, dt))
        state.camera.quaternion.slerp(q, THREE.MathUtils.damp(0, 1, 3, dt))
    })
    return (
        <group
            ref={ref}
            onClick={e=>(e.stopPropagation(), setLocation((e.object === clicked.current)?"/":"/item/"+e.object.name))}
            onPointerMissed={()=>setLocation("/")}
        >
            {images.map(props=><Frame key={props.url} {...props} />)}
        </group>
    )
}


function Frame ({url, ...props}) {
    const name = getUuidByString(url);
    return (
        <group
            {...props} 
        >
            <mesh 
                name={name}
                scale={[1, 2, 0.05]}
                position={[0, 1.3, 0]}>
            
                <boxGeometry/>
                <meshStandardMaterial color="red"/>
                <Image raycast={()=>null} position={[0, 0, 0.6]}  url={url}/>
            </mesh>
        </group>
    )
}