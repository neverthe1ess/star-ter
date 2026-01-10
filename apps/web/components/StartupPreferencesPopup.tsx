"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { Button } from "./ui/button";
import {
  AGE_OPTIONS,
  REGION_OPTIONS,
  OPERATING_TIME_OPTIONS,
  CAPITAL_OPTIONS,
  type OnboardingData,
} from "./onboarding/onboarding-options";

type StartupPreferencesPopupProps = {
  initialData?: OnboardingData;
  onClose: () => void;
  onSave: (data: OnboardingData) => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
};

export function StartupPreferencesPopup({
  initialData,
  onClose,
  onSave,
  isSaving,
  isLoading,
  error,
}: StartupPreferencesPopupProps) {
  const [data, setData] = useState<OnboardingData>({
    age: "",
    region: "",
    operatingTime: "",
    capital: "",
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const isValid = useMemo(
    () => !!data.age && !!data.region && !!data.operatingTime && !!data.capital,
    [data],
  );

  const handleSave = async () => {
    if (!isValid) return;
    await onSave(data);
  };

  return (
    <>
      <motion.div
        key="preferences-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <motion.div
        key="preferences-popup"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="fixed left-1/2 top-1/2 z-50 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-black text-slate-900">창업 조건 설정</h2>
          <p className="text-sm text-slate-500 mt-1">
            온보딩에서 입력한 창업 조건을 다시 설정할 수 있습니다.
          </p>
          {isLoading && <p className="text-xs text-slate-400 mt-2">불러오는 중...</p>}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-8 py-6 space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500">나이</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {AGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData((prev) => ({ ...prev, age: option.value }))}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    data.age === option.value
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="text-base font-bold text-slate-900">{option.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500">선호 지역</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {REGION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData((prev) => ({ ...prev, region: option.value }))}
                  className={`rounded-2xl border-2 p-4 text-center transition-all ${
                    data.region === option.value
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <option.Icon className="w-5 h-5 text-slate-900" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{option.label}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500">희망 운영 시간</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {OPERATING_TIME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData((prev) => ({ ...prev, operatingTime: option.value }))}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    data.operatingTime === option.value
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <option.Icon className="w-5 h-5 text-slate-900" />
                    <div>
                      <div className="text-base font-bold text-slate-900">{option.label}</div>
                      <div className="text-xs text-slate-500">{option.time}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500">창업 자본금</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {CAPITAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData((prev) => ({ ...prev, capital: option.value }))}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    data.capital === option.value
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="text-base font-bold text-slate-900">{option.label}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between">
          {error ? <p className="text-sm text-red-500">{error}</p> : <span />}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="px-6">
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving || isLoading}
              className="px-6"
            >
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
