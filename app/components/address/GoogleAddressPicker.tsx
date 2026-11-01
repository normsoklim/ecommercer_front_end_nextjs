"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

export type SelectedAddress = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  addressLine?: string;
};

type Props = {
  onSelect: (address: SelectedAddress) => void;
};

const DEFAULT_POSITION = {
  lat: 11.5564,
  lng: 104.9282,
};

const BILLING_ERROR_MESSAGE =
  "Google Maps billing is not enabled on this Google Cloud Project. " +
  "Go to https://console.cloud.google.com/project/_/billing/enable to enable billing, " +
  "then enable the Places API and Geocoding API for your project. " +
  "Learn more: https://developers.google.com/maps/gmp-get-started";

function AddressMap({ onSelect }: Props) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [placeId, setPlaceId] = useState<string>();
  const [error, setError] = useState("");
  const [mapsFailed, setMapsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const map = useMap();
  const placesLibrary = useMapsLibrary("places");
  const geocodingLibrary = useMapsLibrary("geocoding");

  const errorRef = useRef(error);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  async function findAddress() {
    if (!placesLibrary || !map || !search.trim()) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { suggestions } =
        await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: search,
          locationBias: {
            center: DEFAULT_POSITION,
            radius: 30000,
          },
        });

      const suggestion = suggestions?.[0];
      const placePrediction = suggestion?.placePrediction;

      if (!placePrediction) {
        setError("No matching address found. Try another search.");
        return;
      }

      const place = await placePrediction.toPlace();
      const { place: fetchedPlace } = await place.fetchFields({
        fields: [
          "formatted_address",
          "geometry",
          "place_id",
          "address_components",
        ],
      });
      const result = fetchedPlace;

      const location = result?.location;

      if (!location) {
        setError("Could not load this address.");
        return;
      }

      const nextPosition = {
        lat: location.lat(),
        lng: location.lng(),
      };

      setPosition(nextPosition);
      setAddress(result.formattedAddress ?? "");
      setPlaceId(result.id ?? placePrediction.placeId ?? undefined);

      const components = result.addressComponents ?? [];
      const countryComponent = components.find((component) =>
        component.types?.includes("country"),
      );
      const postalComponent = components.find((component) =>
        component.types?.includes("postal_code"),
      );
      const cityComponent = components.find(
        (component) =>
          component.types?.includes("locality") ||
          component.types?.includes("administrative_area_level_2"),
      );
      const streetComponent = components.find((component) =>
        component.types?.includes("route"),
      );

      const addressLine = streetComponent?.longText
        ? [streetComponent.longText, result.formattedAddress ?? ""]
            .join(", ")
            .split(",")[0]
        : result.formattedAddress ?? "";

      onSelect({
        formattedAddress: result.formattedAddress ?? "",
        latitude: nextPosition.lat,
        longitude: nextPosition.lng,
        placeId: result.id ?? placePrediction.placeId ?? undefined,
        addressLine: addressLine || undefined,
      });

      map.panTo(nextPosition);
      map.setZoom(17);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      if (
        message.includes("billing") ||
        message.includes("Billing") ||
        message.includes("You must enable Billing")
      ) {
        setMapsFailed(true);
        setError(BILLING_ERROR_MESSAGE);
      } else {
        setError("Address search failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePosition(
    nextPosition: { lat: number; lng: number },
  ) {
    setPosition(nextPosition);
    setError("");

    if (!geocodingLibrary) return;

    setIsLoading(true);

    try {
      const geocoder = new geocodingLibrary.Geocoder();
      const result = await geocoder.geocode({
        location: nextPosition,
      });

      setAddress(result.results[0]?.formatted_address ?? "");
      setPlaceId(result.results[0]?.place_id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      if (
        message.includes("billing") ||
        message.includes("Billing") ||
        message.includes("You must enable Billing")
      ) {
        setMapsFailed(true);
        setError(BILLING_ERROR_MESSAGE);
      } else {
        setAddress("");
        setPlaceId(undefined);
        setError("Could not find an address for this point.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function confirmAddress() {
    if (!address.trim()) {
      setError("Search for an address or select a valid map location.");
      return;
    }

    onSelect({
      formattedAddress: address,
      latitude: position.lat,
      longitude: position.lng,
      placeId,
    });
  }

  if (mapsFailed) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <h3 className="text-sm font-semibold text-rose-900">
            Google Maps is unavailable
          </h3>
          <p className="mt-1 text-xs text-rose-700">
            {errorRef.current || BILLING_ERROR_MESSAGE}
          </p>
          <p className="mt-2 text-xs text-rose-600">
            You can still enter your delivery address manually in the form below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void findAddress();
            }
          }}
          placeholder="Search a Phnom Penh address..."
          disabled={isLoading}
          className="min-w-0 flex-1 rounded-lg border p-3 disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={() => void findAddress()}
          disabled={isLoading}
          className="rounded-lg bg-black px-4 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Map
          defaultCenter={DEFAULT_POSITION}
          defaultZoom={13}
          style={{ width: "100%", height: "380px" }}
          gestureHandling="greedy"
          onClick={(event) => {
            const point = event.detail.latLng;
            if (point) {
              void updatePosition({
                lat: point.lat,
                lng: point.lng,
              });
            }
          }}
        >
          <Marker position={position} />
        </Map>
      </div>

      {address && (
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium">Delivery address</p>
          <p className="mt-1 text-sm">{address}</p>
          <p className="mt-1 text-xs text-gray-500">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={confirmAddress}
        disabled={!address.trim()}
        className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
      >
        Use this delivery address
      </button>
    </div>
  );
}

export default function GoogleAddressPicker(props: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapsDisabled =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_DISABLED === "true";

  if (mapsDisabled) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Google Maps is disabled
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            Set NEXT_PUBLIC_GOOGLE_MAPS_DISABLED=false to enable the address
            picker and map.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            You can still enter your delivery address manually in the form below.
          </p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <p className="text-sm text-red-600">
        Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        in your environment variables.
      </p>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places", "geocoding"]}>
      <AddressMap {...props} />
    </APIProvider>
  );
}
