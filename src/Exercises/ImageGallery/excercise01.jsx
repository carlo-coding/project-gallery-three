import * as React from "react";
import * as THREE from "three";
import { useLocation, useRoute } from "wouter";
import getUuidByString from "uuid-by-string";
import { Canvas, useFrame,  } from "@react-three/fiber";
import { useCursor, MeshReflectorMaterial, Image, Environment } from "@react-three/drei";
import "./styles.css";

export default function App({ images }) {

    return (
        <Canvas dpr={window.devicePixelRatio} camera={{fov: 70, position: [0, 0.5, 5]}}>
            <color attach="background" args={["#191920"]}/>
            <fog attach="fog" args={["#191920", 3]}/>
            <Environment preset="city"/>
            <group position={[0, -0.5, 0]}>
                <Frames images={images}/>  
                <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]}>
                    <planeGeometry args={[50, 50]}/>
                    <MeshReflectorMaterial 
                        color="#984d95"
                        blur={1}
                        resolution={10}
                        mixBlur={1}
                        mixStrength={1}
                        roughness={10}
                        depthScale={10}
                        minDepthThreshold={1}
                        maxDepthThreshold={1}
                        metalness={0.5}
                    />
                </mesh>
            </group>
        </Canvas>
    )
}

function Frames({images, q = new THREE.Quaternion(), p = new THREE.Vector3()}) {
    const ref = React.useRef(null);
    const clicked = React.useRef(null);
    const [,params] = useRoute("/item/:id");
    const [,setLocation] = useLocation();

    React.useEffect(()=> {
        clicked.current = ref.current.getObjectByName(params?.id);
        if (clicked.current) {
            clicked.current.parent.updateWorldMatrix(true, true);
            clicked.current.parent.localToWorld(p.set(0, 0.8, 1.25));
            clicked.current.parent.getWorldQuaternion(q);
        }else {
            console.log("Reseteando")
            p.set(0, 0, 5.5);
            q.identity();
        }
    });

    useFrame((state, dt)=> {
        state.camera.position.lerp(p, THREE.MathUtils.damp(0, 1, 3, dt));
        state.camera.quaternion.slerp(q, THREE.MathUtils.damp(0, 1, 3, dt));
    })
    return (
        <group 
            ref={ref}
            onClick={e=>(e.stopPropagation(), setLocation((e.object===clicked.current)?"/":"/item/"+e.object.name))}
            onPointerMissed={()=>setLocation("/")}
        >
            {images.map(props=><Frame key={props.url} {...props}/>)}    
        </group>
    );
}


function Frame({url, ...props}) {
    const name = getUuidByString(url);
    return (
        <group {...props}>
            <mesh
                name={name}
                scale={[1, 3, 0.1]}
            >
                <boxGeometry />
                <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
                <Image raycast={() => null} position={[0, 0, 0.7]} url={url} />
            </mesh>
        </group>
    )
}