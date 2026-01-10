'use client';

import { useState } from 'react';
import { FEATURES } from './mock/features-data';
import { FaRobot, FaHome, FaDatabase } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);
  const feature = FEATURES[activeTab];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                {FEATURES.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(index)}
                    className={`text-sm px-3 py-1 rounded-full transition-colors ${
                      activeTab === index
                        ? 'bg-white border border-gray-300 shadow-sm font-medium text-blue-900'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <h2 className="text-4xl font-extrabold min-h-[80px]">
                {feature.title}
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed min-h-[84px]">
                {feature.description}
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 h-[480px] flex flex-col justify-between overflow-hidden">
              {feature.type === 'real-estate' && feature.realEstateInfo ? (
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        부동산 정보
                      </h2>
                      <div className="text-sm text-gray-500 font-medium mb-4">
                        선택한 업종에 알맞은 매물
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {feature.realEstateInfo.grids.map((grid, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 hover:bg-blue-50/50 transition-colors group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-gray-500 font-medium">
                                {grid.label}
                              </p>
                              {grid.icon}
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {grid.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        인근 매물 정보
                      </h3>
                      <div className="space-y-3">
                        {feature.realEstateInfo.listings.map((listing, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group bg-white"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                                  {listing.name}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                  listing.status === '계약가능'
                                    ? 'bg-green-100 text-green-700'
                                    : listing.status === '급매'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {listing.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="font-medium">{listing.price}</p>
                              <p className="text-xs text-gray-400">
                                {listing.details}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {feature.metricTitle}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {feature.metricValue}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {feature.type === 'chat' && feature.chatMessages ? (
                      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 mb-4 h-[240px] flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px] opacity-50" />
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
                          {feature.chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex gap-3 ${
                                msg.role === 'user'
                                  ? 'flex-row-reverse'
                                  : 'flex-row'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border">
                                {msg.role === 'user' ? (
                                  <IoMdPerson size={20} />
                                ) : (
                                  <FaRobot size={20} />
                                )}
                              </div>
                              <div
                                className={`mb-1 max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                  msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 relative z-10"></div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-4">
                        <div className="flex flex-col lg:flex-row items-center gap-10">
                          <div className="relative shrink-0">
                            <svg className="w-32 h-32 transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                className="text-slate-200"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={364}
                                strokeDashoffset={
                                  364 * (1 - feature.score / 100)
                                }
                                className="text-blue-950 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-black text-blue-950">
                                {feature.score}%
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3 text-center lg:text-left">
                            <h3 className="text-l font-bold text-blue-950 leading-tight">
                              {feature.scoreTitle}
                            </h3>
                            <p className="text-slate-500 text-base leading-relaxed break-keep">
                              {feature.scoreDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {feature.stats.map((metric) => (
                      <div
                        key={metric.label}
                        className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm"
                      >
                        <p className="text-xs font-bold text-slate-400 mb-2">
                          {metric.label}
                        </p>
                        <p className="text-xl font-black text-slate-900">
                          {metric.value}
                        </p>
                        <p
                          className={`text-[11px] font-bold mt-1 ${metric.color || 'text-slate-400'}`}
                        >
                          {metric.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            데이터로 증명하는 3단계 신뢰 시스템
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            Starter는 가장 객관적인 데이터를 수집하고 가공하여 창업자에게
            전달합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaDatabase size={36} color="gray" />
              </div>
              <h3 className="text-xl font-bold mb-3">공공데이터 연동</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                정부 및 지자체에서 제공하는
                <br />
                검증된 상권 데이터를
                <br />
                실시간으로 수집합니다.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaHome size={40} color="gray" />
              </div>
              <h3 className="text-xl font-bold mb-3">부동산 데이터 연동</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                공공 데이터를 기반으로
                <br />
                상가 임대료 시세와
                <br />
                공실 정보를 제공합니다.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaRobot size={40} color="gray" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI 예측 모델</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                자체 개발한 AI 알고리즘이
                <br />
                향후 1년간의 매출 추이와
                <br />
                폐업 위험도를 예측합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
