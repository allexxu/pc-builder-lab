// Game component definitions and drop zones for PC assembly game

// Import component images
import cpuImage from "@/assets/components/cpu.png";
import coolerImage from "@/assets/components/cooler.png";
import ramImage from "@/assets/components/ram.png";
import ssdImage from "@/assets/components/ssd.png";
import gpuImage from "@/assets/components/gpu.png";
import atx24Image from "@/assets/components/atx24.png";
import eps8Image from "@/assets/components/eps8.png";
import fanImage from "@/assets/components/fan.png";

export type ComponentId = 
  | "cpu" 
  | "cooler" 
  | "ram1" 
  | "ram2" 
  | "ssd" 
  | "gpu" 
  | "atx24" 
  | "eps8" 
  | "fan1" 
  | "fan2";

export type ZoneId = 
  | "cpu-socket" 
  | "cooler-mount" 
  | "ram-slot-1" 
  | "ram-slot-2" 
  | "m2-slot" 
  | "pcie-x16" 
  | "atx-connector" 
  | "eps-connector" 
  | "fan-header-1" 
  | "fan-header-2";

export interface GameComponent {
  id: ComponentId;
  name: string;
  description: string;
  targetZone: ZoneId;
  order: number;
  dependency?: ComponentId;
  icon: string;
  image: string;
  color: string;
  hint: string;
}

export interface DropZone {
  id: ZoneId;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  acceptsComponent: ComponentId;
}

export const GAME_COMPONENTS: GameComponent[] = [
  {
    id: "cpu",
    name: "Procesor (CPU)",
    description: "Intel Core i5 sau AMD Ryzen 5",
    targetZone: "cpu-socket",
    order: 1,
    icon: "Cpu",
    image: cpuImage,
    color: "hsl(var(--primary))",
    hint: "Se plasează în socket-ul central al plăcii de bază"
  },
  {
    id: "cooler",
    name: "Cooler CPU",
    description: "Sistem de răcire pentru procesor",
    targetZone: "cooler-mount",
    order: 2,
    dependency: "cpu",
    icon: "Fan",
    image: coolerImage,
    color: "hsl(var(--primary))",
    hint: "Se montează direct pe procesor, după aplicarea pastei termice"
  },
  {
    id: "ram1",
    name: "RAM DDR5 #1",
    description: "Modul de memorie 16GB",
    targetZone: "ram-slot-1",
    order: 3,
    icon: "MemoryStick",
    image: ramImage,
    color: "hsl(var(--accent))",
    hint: "Se inserează în primul slot RAM (de obicei A2)"
  },
  {
    id: "ram2",
    name: "RAM DDR5 #2",
    description: "Modul de memorie 16GB",
    targetZone: "ram-slot-2",
    order: 4,
    icon: "MemoryStick",
    image: ramImage,
    color: "hsl(var(--accent))",
    hint: "Se inserează în al doilea slot RAM (de obicei B2)"
  },
  {
    id: "ssd",
    name: "SSD M.2 NVMe",
    description: "Stocare rapidă 1TB",
    targetZone: "m2-slot",
    order: 5,
    icon: "HardDrive",
    image: ssdImage,
    color: "hsl(30, 100%, 50%)",
    hint: "Se montează în slotul M.2, sub heatsink"
  },
  {
    id: "gpu",
    name: "Placă Video (GPU)",
    description: "NVIDIA RTX sau AMD RX",
    targetZone: "pcie-x16",
    order: 6,
    icon: "Monitor",
    image: gpuImage,
    color: "hsl(270, 100%, 65%)",
    hint: "Se inserează în slotul PCIe x16 principal"
  },
  {
    id: "atx24",
    name: "Cablu ATX 24-pin",
    description: "Alimentare principală placă de bază",
    targetZone: "atx-connector",
    order: 7,
    icon: "Cable",
    image: atx24Image,
    color: "hsl(45, 100%, 50%)",
    hint: "Conectorul mare din dreapta plăcii de bază"
  },
  {
    id: "eps8",
    name: "Cablu EPS 8-pin",
    description: "Alimentare CPU",
    targetZone: "eps-connector",
    order: 8,
    icon: "Plug",
    image: eps8Image,
    color: "hsl(45, 100%, 50%)",
    hint: "Conectorul din partea de sus, lângă socket-ul CPU"
  },
  {
    id: "fan1",
    name: "Ventilator Carcasă #1",
    description: "Fan intake 120mm",
    targetZone: "fan-header-1",
    order: 9,
    icon: "Wind",
    image: fanImage,
    color: "hsl(200, 100%, 50%)",
    hint: "Se conectează la header-ul SYS_FAN1"
  },
  {
    id: "fan2",
    name: "Ventilator Carcasă #2",
    description: "Fan exhaust 120mm",
    targetZone: "fan-header-2",
    order: 10,
    icon: "Wind",
    image: fanImage,
    color: "hsl(200, 100%, 50%)",
    hint: "Se conectează la header-ul SYS_FAN2"
  }
];

export const DROP_ZONES: DropZone[] = [
  {
    id: "cpu-socket",
    name: "Socket CPU",
    description: "LGA 1700 / AM5 - aici se montează procesorul",
    x: 180,
    y: 120,
    width: 80,
    height: 80,
    color: "hsl(var(--primary))",
    acceptsComponent: "cpu"
  },
  {
    id: "cooler-mount",
    name: "Montură Cooler",
    description: "Zona de montare pentru sistemul de răcire CPU",
    x: 170,
    y: 110,
    width: 100,
    height: 100,
    color: "hsl(var(--primary))",
    acceptsComponent: "cooler"
  },
  {
    id: "ram-slot-1",
    name: "Slot RAM A2",
    description: "Slot DIMM pentru memoria RAM",
    x: 300,
    y: 80,
    width: 20,
    height: 120,
    color: "hsl(var(--accent))",
    acceptsComponent: "ram1"
  },
  {
    id: "ram-slot-2",
    name: "Slot RAM B2",
    description: "Slot DIMM pentru memoria RAM",
    x: 330,
    y: 80,
    width: 20,
    height: 120,
    color: "hsl(var(--accent))",
    acceptsComponent: "ram2"
  },
  {
    id: "m2-slot",
    name: "Slot M.2",
    description: "Slot pentru SSD NVMe M.2",
    x: 120,
    y: 250,
    width: 80,
    height: 25,
    color: "hsl(30, 100%, 50%)",
    acceptsComponent: "ssd"
  },
  {
    id: "pcie-x16",
    name: "Slot PCIe x16",
    description: "Slot pentru placa video",
    x: 60,
    y: 300,
    width: 200,
    height: 30,
    color: "hsl(270, 100%, 65%)",
    acceptsComponent: "gpu"
  },
  {
    id: "atx-connector",
    name: "Conector ATX 24-pin",
    description: "Alimentare principală a plăcii de bază",
    x: 380,
    y: 140,
    width: 30,
    height: 100,
    color: "hsl(45, 100%, 50%)",
    acceptsComponent: "atx24"
  },
  {
    id: "eps-connector",
    name: "Conector EPS 8-pin",
    description: "Alimentare CPU de la sursa de tensiune",
    x: 60,
    y: 40,
    width: 50,
    height: 25,
    color: "hsl(45, 100%, 50%)",
    acceptsComponent: "eps8"
  },
  {
    id: "fan-header-1",
    name: "SYS_FAN1",
    description: "Header pentru ventilator carcasă",
    x: 380,
    y: 40,
    width: 30,
    height: 20,
    color: "hsl(200, 100%, 50%)",
    acceptsComponent: "fan1"
  },
  {
    id: "fan-header-2",
    name: "SYS_FAN2",
    description: "Header pentru ventilator carcasă",
    x: 380,
    y: 280,
    width: 30,
    height: 20,
    color: "hsl(200, 100%, 50%)",
    acceptsComponent: "fan2"
  }
];

export const GAME_CONFIG = {
  training: {
    timeLimit: 0, // No limit
    lives: Infinity,
    hintsEnabled: true,
    penaltyPoints: 0,
    showExplanations: true
  },
  challenge: {
    timeLimit: 300, // 5 minutes
    lives: 3,
    hintsEnabled: true,
    penaltyPoints: 30,
    showExplanations: false
  },
  ranked: {
    timeLimit: 240, // 4 minutes
    lives: Infinity,
    hintsEnabled: false,
    penaltyPoints: 30,
    showExplanations: false
  }
};

export const POINTS = {
  correctPlacement: 100,
  timeBonus: 200, // Max bonus based on remaining time
  perfectBonus: 2, // Multiplier for 0 mistakes
  noHintsBonus: 150
};
