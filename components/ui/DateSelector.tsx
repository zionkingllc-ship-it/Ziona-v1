import { XStack, YStack } from "tamagui";
import { DateWheel } from "./DateWheel";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 6;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 100 }, (_, i) => 2024 - i);

export function DateSelector({ date, setDate }) {
  return (
    <YStack position="relative" width="100%" alignItems="center">
      {/* Selection band */}
      <YStack
        position="absolute"
        top={CENTER_INDEX * ITEM_HEIGHT}
        height={ITEM_HEIGHT}
        width="90%"
        backgroundColor="#EEEBEF"
        borderRadius={25}
        pointerEvents="none"
      />

      <XStack justifyContent="center" gap={12}>
        <DateWheel
          data={months}
          value={months[date.getMonth()]}
          onChange={(month) => {
            const newDate = new Date(date);
            newDate.setMonth(months.indexOf(month));
            setDate(newDate);
          }}
        />

        <DateWheel
          data={days}
          value={date.getDate()}
          onChange={(day) => {
            const newDate = new Date(date);
            newDate.setDate(day);
            setDate(newDate);
          }}
        />

        <DateWheel
          data={years}
          value={date.getFullYear()}
          onChange={(year) => {
            const newDate = new Date(date);
            newDate.setFullYear(year);
            setDate(newDate);
          }}
        />
      </XStack>
    </YStack>
  );
}