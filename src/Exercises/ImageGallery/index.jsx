import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCursor, MeshReflectorMaterial, Image, Text, Environment } from '@react-three/drei'
import { useRoute, useLocation } from 'wouter'
import getUuid from 'uuid-by-string';
import "./styles.css"

const GOLDENRATIO = 1.61803398875

export default function App({ images }) {
    // EN esta parte no hay mucho que explicar, se explica sólo
  return (
    <Canvas dpr={window.devicePixelRatio} camera={{ fov: 70, position: [0, 2, 15] }}>
      <color attach="background" args={['#191920']} />
      <fog attach="fog" args={['#191920', 0, 15]} />
      <Environment preset="city" />
      <group position={[0, -0.5, 0]}>
        <Frames images={images} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={60}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#151515"
            metalness={0.5}
          />
        </mesh>
      </group>
    </Canvas>
  )
}

function Frames({ images, q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
    /* El ref va a ser para tener acceso al grupo en donde se alojan las imagenes
    clicked lo usaremos para almacenar una referencia al objeto clickeado
    con params vamos a poder acceder al id de la url 
    con setLocation podemos establecer el valor de la url
    */
    const ref = useRef()
    const clicked = useRef()
    const [, params] = useRoute('/item/:id')
    const [, setLocation] = useLocation();
    useEffect(() => {
        /*En cada re-render usamos el método del grupo getObjectByName para almacenar 
        una referencia del objeto clickeado en clicked.current
        clicked.current.parent accede al elemento group con los siguientes métodos:
        updateWorldMatrix(updateParents: boolean, updateChildren: boolean ) 
        para actualizar globalmente las transformaciones 
        updateParents para actualizar de forma recursiva los ancestros 
        updateChildren para actualizar de forma recursiva los descendientes 

        localToWorld sepa que hace

        Los cuaterniones representan rotaciones
        */
        clicked.current = ref.current.getObjectByName(params?.id);
        if (clicked.current) {
            // Al parecer al haber un click localToWorld y getWorldQuaternion actualizan 
            // Los valores del vector p y la rotación q que después se usa en useFrame 
            // Para mover la camara
            clicked.current.parent.updateWorldMatrix(true, true)
            clicked.current.parent.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25)); // p obtiene la posición del mundo
            clicked.current.parent.getWorldQuaternion(q); // q optiene la rotación del mundo
        } else {
            // Cuando no hay click el vector p se establece en un posición default
            p.set(0, 0, 5.5)
            // Y la rotación vuelve a 0,0,0
            q.identity()
        }
    })
    useFrame((state, dt) => {
        // use frame es el equivalente a requestAnimationFrame
        // Recuerda que state es el estado actual de el canvas
        // dt es el tiempo que pasa de un frame a otro en segundos (float)

        state.camera.position.lerp(p, THREE.MathUtils.damp(0, 1, 3, dt)) // Animación Movimiento
        state.camera.quaternion.slerp(q, THREE.MathUtils.damp(0, 1, 3, dt)) //Animación Rotación

        // CAMERA POSITION LERP

        // camera.position es un vector3 al cual se le puede aplicar la función lerp
        // Para hacer una transición suave 
        // Los parametros de lerp son primero el vector de destino 
        // y segundo el factor de interpolación
        // Para crear un factor de interpolación entre los frames 
        // Se puede usar THREE.MathUtils.damp(x, y, lambda, dt)
        // x es el punto actual, y es el punto de destino
        // lambda indica la rapidez del movimiento
        // El dt es el tiempo delta en segundos

        // CAMERA QUATERNION SLERP
        /*
        slerp maneja interpolación esferica entre quaterniones */
    })
    return (
        <group
        ref={ref}
        onClick={(e) => (e.stopPropagation(), setLocation(clicked.current === e.object ? '/' : '/item/' + e.object.name))}
        onPointerMissed={() => setLocation('/')}>
        {images.map((props) => <Frame key={props.url} {...props} /> /* prettier-ignore */)}
        </group>
    )
}
/*
Tal parece que el evento del grupo al hacer click tiene la propiedad object y el método getObjectByName
*/

function Frame({ url, c = new THREE.Color(), ...props }) {
  const [hovered, hover] = useState(false)
  const [rnd] = useState(() => Math.random())
  const image = useRef()
  const frame = useRef()
  const name = getUuid(url)
  useCursor(hovered)
  useFrame((state) => {
    image.current.material.zoom = 2 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2
    image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, 0.85 * (hovered ? 0.85 : 1), 0.1)
    image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, 0.9 * (hovered ? 0.905 : 1), 0.1)
    frame.current.material.color.lerp(c.set(hovered ? 'orange' : 'white').convertSRGBToLinear(), 0.1)
  })
  return (
    <group {...props}>
      <mesh
        name={name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url} />
      </mesh>
      <Text maxWidth={0.1} anchorX="left" anchorY="top" position={[0.55, GOLDENRATIO, 0]} fontSize={0.025}>
        {name.split('-').join(' ')}
      </Text>
    </group>
  )
}

