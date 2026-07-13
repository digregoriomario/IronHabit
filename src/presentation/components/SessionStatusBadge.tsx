import { CircleCheck, CircleX, Clock3 } from "lucide-react-native";
import { Text, View } from "react-native";

import type { SessionStatus } from "../../domain/types";
import { colors } from "../theme/colors";

export function sessionStatusMeta(status: SessionStatus) {
  const statusMeta = {
    planned: {
      label: "Da svolgere",
      color: colors.info,
      background: colors.infoSoft,
      Icon: Clock3
    },
    completed: {
      label: "Completata",
      color: colors.success,
      background: colors.successSoft,
      Icon: CircleCheck
    },
    skipped: {
      label: "Saltata",
      color: colors.danger,
      background: colors.dangerSoft,
      Icon: CircleX
    }
  };

  return statusMeta[status] || statusMeta.planned;
}

export function SessionStatusBadge({ status, count, compact = false }: { status: SessionStatus; count?: number; compact?: boolean }) {
  const meta = sessionStatusMeta(status);
  const Icon = meta.Icon;
  const label = count === undefined ? meta.label : `${count} ${meta.label.toLowerCase()}`;

  return (
    <View
      className="flex-row items-center gap-2 rounded-md border px-3 py-2"
      style={{ backgroundColor: meta.background, borderColor: meta.color }}
    >
      <Icon size={compact ? 15 : 17} color={meta.color} />
      <Text className={compact ? "text-xs font-semibold" : "text-sm font-semibold"} style={{ color: meta.color }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
