import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { GymCenter } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon (webpack/vite bundling issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface BranchPin {
    gymId: string;
    gymName: string;
    branchId: string;
    branchName: string;
    lat: number;
    lng: number;
    address: string;
    city: string | null;
}

interface Props {
    gyms: GymCenter[];
}

/**
 * Sprint 3 · Gym Map View
 * Renders all gym branches that have lat/lng on a Leaflet map.
 * Branches without coordinates are silently skipped.
 */
export default function GymMapView({ gyms }: Props) {
    // Collect all branches with coordinates
    const pins: BranchPin[] = [];
    for (const gym of gyms) {
        for (const branch of gym.branches || []) {
            const lat = branch.latitude ? Number(branch.latitude) : null;
            const lng = branch.longitude ? Number(branch.longitude) : null;
            if (lat && lng) {
                pins.push({
                    gymId: gym.id,
                    gymName: gym.name,
                    branchId: branch.id,
                    branchName: branch.branch_name,
                    lat,
                    lng,
                    address: branch.address,
                    city: branch.city,
                });
            }
        }
    }

    // Default center: Hà Nội. If we have pins, center on first one.
    const center: [number, number] = pins.length > 0
        ? [pins[0].lat, pins[0].lng]
        : [21.028511, 105.804817];

    if (pins.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[520px] bg-[color:var(--mk-paper)] rounded-lg border border-dashed border-[color:var(--mk-line)]">
                <span className="text-5xl mb-4">🗺️</span>
                <p className="text-[color:var(--mk-muted)] font-medium">Chưa có cơ sở nào có tọa độ bản đồ.</p>
                <p className="text-xs text-[color:var(--mk-muted)] mt-1">Gym owner cần cập nhật latitude/longitude trong cài đặt chi nhánh.</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ height: '520px', width: '100%', borderRadius: '8px' }}
            className="border border-[color:var(--mk-line)]"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pins.map(pin => (
                <Marker key={pin.branchId} position={[pin.lat, pin.lng]}>
                    <Popup>
                        <div className="text-sm" style={{ minWidth: 180 }}>
                            <p className="font-bold text-base mb-0.5">{pin.gymName}</p>
                            <p className="text-[color:var(--mk-text-soft)] text-xs mb-1">{pin.branchName}</p>
                            <p className="text-[color:var(--mk-muted)] text-xs">{pin.address}{pin.city ? `, ${pin.city}` : ''}</p>
                            <a
                                href={`/gyms/${pin.gymId}`}
                                className="inline-block mt-2 text-xs font-bold text-black underline"
                            >
                                Xem chi tiết →
                            </a>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
