import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  VaccinesRounded,
  AddRounded,
  CloseRounded,
  PetsRounded,
  MedicationRounded,
  CheckCircleRounded,
  HourglassEmptyRounded,
  RefreshRounded,
  WarningRounded,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../api/axios";
import PageHeader from "../../components/shared/PageHeader";

// ─── Compute status on frontend (don't trust backend status alone) ───────────
const computeStatus = (item) => {
  if (item.taken_at) return "done";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(item.scheduled_date);
  scheduled.setHours(0, 0, 0, 0);
  if (scheduled < today) return "overdue";
  return "pending";
};

// ─── Style map ───────────────────────────────────────────────────────────────
const statusStyles = (computedStatus, t) => {
  if (computedStatus === "done")
    return {
      label: t("vaccines.done"),
      bg: "rgba(61,139,99,0.12)",
      fg: "#2d6a4f",
    };
  if (computedStatus === "pending")
    return {
      label: t("vaccines.upcomingLabel"),
      bg: "rgba(212,160,23,0.15)",
      fg: "#8a6d12",
    };
  if (computedStatus === "overdue")
    return {
      label: t("vaccines.needsAction"),
      bg: "rgba(196,92,82,0.12)",
      fg: "#a34740",
    };
  return {
    label: computedStatus ?? t("vaccines.scheduled"),
    bg: "action.hover",
    fg: "text.secondary",
  };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const animalColor = (animalName) => {
  const name = (animalName ?? "").toLowerCase();
  if (name.includes("dog")) return "#8d6e63";
  if (name.includes("cat")) return "#d97b5c";
  if (name.includes("bird")) return "#4a90a4";
  if (name.includes("horse")) return "#7d6b5c";
  if (name.includes("cow")) return "#4a7c59";
  if (name.includes("sheep")) return "#7a8f7e";
  return "#4a7c59";
};

// ─── Deduplicate + inject computedStatus ─────────────────────────────────────
const parseSchedules = (resData) => {
  const raw = resData?.data ?? [];
  const unique = Array.from(
    new Map(raw.map((item) => [item.id, item])).values(),
  );
  return unique.map((item) => ({
    ...item,
    computedStatus: computeStatus(item),
  }));
};

// ─── ScheduleCard ─────────────────────────────────────────────────────────────
function ScheduleCard({ row, onDone }) {
  const { t } = useTranslation();
  const animalNickname = row.user_animal?.nickname ?? "—";
  const animalType = row.user_animal?.animal?.name ?? "";
  const vaccineName = row.vaccine?.name ?? t("vaccines.fallbackVaccine");
  const st = statusStyles(row.computedStatus, t);
  const lineColor = animalColor(animalType);
  const isOverdue = row.computedStatus === "overdue";

  return (
    <Card
      sx={{
        overflow: "hidden",
        border: isOverdue ? "1px solid rgba(196,92,82,0.35)" : undefined,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 4,
              alignSelf: "stretch",
              borderRadius: 4,
              bgcolor: isOverdue ? "#c45c52" : lineColor,
              flexShrink: 0,
            }}
          />
          <Avatar
            sx={{
              bgcolor: `${lineColor}22`,
              color: lineColor,
              width: 48,
              height: 48,
            }}
          >
            <PetsRounded />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight={700}
            >
              {animalType || t("vaccines.fallbackAnimal")}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ fontSize: "1.05rem" }}
            >
              {animalNickname}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 1 }}
            >
              <MedicationRounded
                sx={{ fontSize: 18, color: "secondary.dark" }}
              />
              <Typography variant="body2" fontWeight={600}>
                {vaccineName}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                label={t("vaccines.planned", {
                  date: formatDate(row.scheduled_date),
                })}
                sx={{ fontWeight: 700, bgcolor: "background.default" }}
              />
              {row.computedStatus === "done" && row.taken_at && (
                <Chip
                  size="small"
                  label={t("vaccines.given", {
                    date: formatDate(row.taken_at),
                  })}
                  sx={{ fontWeight: 700, bgcolor: "rgba(61,139,99,0.1)" }}
                />
              )}
              <Chip
                size="small"
                label={st.label}
                sx={{
                  fontWeight: 800,
                  bgcolor: st.bg,
                  color: st.fg,
                  border: "none",
                }}
              />
            </Stack>
          </Box>

          {/* Action icon */}
          <Stack spacing={0.5}>
            {row.computedStatus === "done" ? (
              <IconButton
                disabled
                sx={{ bgcolor: "rgba(61,139,99,0.12)", color: "success.main" }}
              >
                <CheckCircleRounded />
              </IconButton>
            ) : row.computedStatus === "overdue" ? (
              <Tooltip title={t("vaccines.markDone")}>
                <IconButton
                  onClick={() => onDone(row.id)}
                  sx={{ bgcolor: "rgba(196,92,82,0.12)", color: "error.dark" }}
                >
                  <WarningRounded />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={t("vaccines.markDone")}>
                <IconButton
                  onClick={() => onDone(row.id)}
                  sx={{
                    bgcolor: "rgba(212,160,23,0.12)",
                    color: "warning.dark",
                  }}
                >
                  <HourglassEmptyRounded />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VaccineSchedule() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [, setMyAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  /* const [vaccines, setVaccines]               = useState([]);
   const [vaccinesLoading, setVaccinesLoading] = useState(false);
   const [openAdd, setOpenAdd]                 = useState(false);
   const [form, setForm] = useState({
     user_animal_id: '',
     vaccine_id:     '',
     scheduled_date: '',
   });
   const [errors, setErrors] = useState({}); */

  const applySchedules = (resData) => {
    const incoming = parseSchedules(resData);
    setSchedules((prev) => {
      const incomingIds = incoming.map((i) => i.id).join(",");
      const prevIds = prev.map((i) => i.id).join(",");
      if (incomingIds === prevIds) return prev;
      return incoming;
    });
  };

  const loadSchedules = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get("/vaccine-schedules");
      applySchedules(res.data);
    } catch {
      toast.error(t("vaccines.loadFailed"));
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [schedulesRes, animalsRes] = await Promise.all([
          api.get("/vaccine-schedules"),
          api.get("/my-animals"),
        ]);
        if (cancelled) return;
        applySchedules(schedulesRes.data);
        const animals = animalsRes.data?.data ?? animalsRes.data ?? [];
        setMyAnimals(Array.isArray(animals) ? animals : []);
      } catch {
        if (!cancelled) toast.error(t("vaccines.loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  /* useEffect(() => {
     if (!form.user_animal_id) { setVaccines([]); return; }
     let cancelled = false;

     const fetchVaccines = async () => {
       setVaccinesLoading(true);
       try {
         const res    = await api.get(`/my-animals/${form.user_animal_id}`);
         const animal = res.data?.data ?? res.data;
         if (cancelled) return;

         const vacList =
           animal?.vaccines ??
           animal?.animal?.vaccines ??
           animal?.available_vaccines ??
           [];

      if (vacList.length > 0) {
        setVaccines(vacList);
      } else {
        const animalTypeId = animal?.animal_id ?? animal?.animal?.id;
        if (animalTypeId) {
          const vacRes = await api.get(`/vaccines`, { params: { animal_id: animalTypeId } });
          if (!cancelled) {
            const vList = vacRes.data?.data ?? vacRes.data ?? [];
            setVaccines(Array.isArray(vList) ? vList : []);
          }
        } else {
          setVaccines([]);
        }
      }
    } catch {
      if (!cancelled) setVaccines([]);
    } finally {
      if (!cancelled) setVaccinesLoading(false);
    }
  };

    fetchVaccines();
    return () => { cancelled = true; };
  }, [form.user_animal_id]); */

  const handleMarkDone = async (id) => {
    try {
      await api.patch(`/vaccine-schedules/${id}/mark-done`);
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                taken_at: new Date().toISOString(),
                computedStatus: "done",
              }
            : s,
        ),
      );
      toast.success(t("vaccines.markedDone"));
    } catch {
      toast.error(t("vaccines.updateFailed"));
    }
  };

  // ─── Derived lists using computedStatus ──────────────────────────────────
  const upcoming = schedules
    .filter((s) => s.computedStatus === "pending")
    .sort((a, b) =>
      String(a.scheduled_date).localeCompare(String(b.scheduled_date)),
    );

  const overdue = schedules
    .filter((s) => s.computedStatus === "overdue")
    .sort((a, b) =>
      String(a.scheduled_date).localeCompare(String(b.scheduled_date)),
    );

  const completed = schedules
    .filter((s) => s.computedStatus === "done")
    .sort((a, b) =>
      String(b.taken_at || b.scheduled_date).localeCompare(
        String(a.taken_at || a.scheduled_date),
      ),
    );

  if (loading) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 560, mx: "auto" }}>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={120} />
      </Stack>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      <PageHeader
        title={t("vaccines.title")}
        subtitle={t("vaccines.subtitle")}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={() => loadSchedules(true)}
              sx={{ fontWeight: 700, borderRadius: 999, px: 2.5 }}
            >
              {t("common.refresh")}
            </Button>
            {/* <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpenAdd(true)}
              sx={{ fontWeight: 800, borderRadius: 999, px: 2.5 }}
            >
              {t('vaccines.planVaccine')}
            </Button> */}
          </>
        }
      />

      {/* Stats */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        {[
          {
            n: completed.length,
            labelKey: "vaccines.completed",
            c: "#2d6a4f",
            b: "rgba(61,139,99,0.12)",
          },
          {
            n: upcoming.length,
            labelKey: "vaccines.upcoming",
            c: "#8a6d12",
            b: "rgba(212,160,23,0.15)",
          },
          {
            n: overdue.length,
            labelKey: "vaccines.needsAction",
            c: "#a34740",
            b: "rgba(196,92,82,0.12)",
          },
        ].map((x) => (
          <Card key={x.labelKey} sx={{ flex: 1 }}>
            <CardContent
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}
            >
              <Avatar sx={{ bgcolor: x.b, color: x.c, width: 44, height: 44 }}>
                <VaccinesRounded />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary.dark">
                  {x.n}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {t(x.labelKey)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Overdue */}
      {overdue.length > 0 && (
        <>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            color="error.dark"
            sx={{ mb: 1.5 }}
          >
            {t("vaccines.needsAction")}
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            {overdue.map((s) => (
              <ScheduleCard key={s.id} row={s} onDone={handleMarkDone} />
            ))}
          </Stack>
        </>
      )}

      {/* Upcoming */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
        {t("vaccines.comingUp")}
      </Typography>
      {upcoming.length === 0 ? (
        <Card sx={{ mb: 4, borderStyle: "dashed" }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <VaccinesRounded
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t("vaccines.emptyCalendar")}
            </Typography>
            {/* <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpenAdd(true)}>
              {t('vaccines.planVaccine')}
            </Button> */}
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {upcoming.map((s) => (
            <ScheduleCard key={s.id} row={s} onDone={handleMarkDone} />
          ))}
        </Stack>
      )}

      {/* Completed */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
        {t("vaccines.completedSection")}
      </Typography>
      {completed.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("vaccines.finishedDoses")}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {completed.map((s) => (
            <ScheduleCard key={s.id} row={s} onDone={handleMarkDone} />
          ))}
        </Stack>
      )}

      {/* ADD DIALOG - Commented out */}
    </Box>
  );
}
