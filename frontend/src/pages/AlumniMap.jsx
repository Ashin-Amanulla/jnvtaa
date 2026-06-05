import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { usersAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import LoadingSpinner from "@/components/LoadingSpinner";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [8.5241, 76.9366];
const TILE_URL =
  import.meta.env.VITE_MAP_TILES_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function AlumniMap() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.usersMap,
    queryFn: () => usersAPI.getAllUsers({ limit: 500 }),
    staleTime: STALE_TIME.ALUMNI_MAP,
  });

  const mapUsers = useMemo(() => {
    const users = data?.data?.users || [];
    return users.filter(
      (u) =>
        u.latitude &&
        u.longitude &&
        u.privacySettings?.showLocation !== false
    );
  }, [data]);

  const center =
    mapUsers.length > 0
      ? [mapUsers[0].latitude, mapUsers[0].longitude]
      : DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border py-16 md:py-20">
        <div className="container-custom">
          <p className="mb-3 inline-block rounded-xl border-2 border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            Where we are
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl">
            Alumni map
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground">
            Batchmates who share their location appear on the map — from Kerala to
            wherever life took you.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && (
            <>
              <p className="mb-4 font-sans text-lg text-muted-foreground">
                {mapUsers.length} alumni on the map
              </p>
              <div className="overflow-hidden rounded-2xl border border-border shadow-card">
                <MapContainer
                  center={center}
                  zoom={mapUsers.length ? 5 : 10}
                  className="h-[28rem] w-full md:h-[36rem]"
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url={TILE_URL}
                  />
                  {mapUsers.map((u) => (
                    <Marker key={u._id} position={[u.latitude, u.longitude]}>
                      <Popup>
                        <div className="font-sans text-sm">
                          <strong>
                            {u.firstName} {u.lastName}
                          </strong>
                          {u.currentCity && (
                            <p className="text-muted-foreground">{u.currentCity}</p>
                          )}
                          <Link
                            to={`/dashboard/alumni/${u._id}`}
                            className="text-brand underline"
                          >
                            View profile
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {mapUsers.length === 0 && (
                <div className="mt-8 rounded-2xl border border-border p-8 text-center">
                  <MapPin className="mx-auto mb-4 text-muted-foreground" size={40} />
                  <p className="font-sans text-lg text-muted-foreground">
                    No alumni with map coordinates yet. Update your profile with
                    location to appear here.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
