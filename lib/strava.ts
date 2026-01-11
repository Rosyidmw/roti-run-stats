import axios from "axios";

export interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  kudos_count: number;
  average_speed: number;
  max_speed: number;
}

export interface AthleteStats {
  recent_run_totals: {
    count: number;
    distance: number; // meter
    moving_time: number; // detik
    elevation_gain: number;
  };
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
}

const stravaApi = axios.create({
  baseURL: "https://www.strava.com/api/v3",
});

export const getActivities = async (
  accessToken: string
): Promise<Activity[]> => {
  try {
    const response = await stravaApi.get("/athlete/activities", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { per_page: 30 }, // Ambil 30 aktivitas terakhir
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

export const getAthleteStats = async (
  accessToken: string,
  athleteId: string
): Promise<AthleteStats | null> => {
  try {
    const response = await stravaApi.get(`/athletes/${athleteId}/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
};

export const formatDistance = (meters: number) => {
  return (meters / 1000).toFixed(2) + " km";
};

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}j ${m}m`;
};
