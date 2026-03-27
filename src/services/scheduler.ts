import { config } from '../config';

export function isBusinessHours(): boolean {
  const now = new Date();
  // Convert to Bogota time
  const bogotaTime = new Date(
    now.toLocaleString('en-US', { timeZone: config.businessHours.timezone })
  );
  const hour = bogotaTime.getHours();
  return hour >= config.businessHours.start && hour < config.businessHours.end;
}

export function getNextBusinessHourStart(): Date {
  const now = new Date();
  const bogotaTime = new Date(
    now.toLocaleString('en-US', { timeZone: config.businessHours.timezone })
  );
  const hour = bogotaTime.getHours();

  if (hour < config.businessHours.start) {
    // Later today
    bogotaTime.setHours(config.businessHours.start, 0, 0, 0);
  } else {
    // Tomorrow
    bogotaTime.setDate(bogotaTime.getDate() + 1);
    bogotaTime.setHours(config.businessHours.start, 0, 0, 0);
  }

  return bogotaTime;
}
