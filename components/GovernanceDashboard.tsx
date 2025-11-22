import React from 'react';
import { GovernancePlan } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { FrequencyIcon } from './icons/FrequencyIcon';
import { ComplianceIcon } from './icons/ComplianceIcon';
import { DeliverabilityIcon } from './icons/DeliverabilityIcon';

interface GovernanceDashboardProps {
    plan: GovernancePlan;
}

export const GovernanceDashboard: React.FC<GovernanceDashboardProps> = ({ plan }) => {
    const { frequencyManagement, complianceAndConsent, aiDrivenDeliverability } = plan;

    return (
        <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
            <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-900">Governance & Compliance Plan</h3>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Frequency Management */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <div className="flex items-center space-x-3 mb-3">
                                <FrequencyIcon className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-base text-slate-800">Frequency Management</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold text-slate-700">Global Cap: {frequencyManagement.globalCaps.messagesPerWeek} msg/week</p>
                                    <p className="text-xs text-slate-500">{frequencyManagement.globalCaps.rationale}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">Channel Caps:</p>
                                    <ul className="list-disc list-inside text-xs text-slate-600 pl-1">
                                        {frequencyManagement.channelSpecificCaps.map(c => <li key={c.channel}>{c.channel}: {c.limit}</li>)}
                                    </ul>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <p className="font-semibold text-slate-700">Intelligent Suppression</p>
                                    <p className="text-xs text-slate-500">{frequencyManagement.intelligentSuppression.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Compliance & Consent */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                             <div className="flex items-center space-x-3 mb-3">
                                <ComplianceIcon className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-base text-slate-800">Compliance & Consent</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold text-slate-700">Primary Regulations:</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                    {complianceAndConsent.primaryRegulations.map(r => (
                                        <span key={r} className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">{r}</span>
                                    ))}
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <p className="font-semibold text-slate-700 mb-1">Data Rights Plan:</p>
                                    <ul className="space-y-2 text-xs">
                                        {complianceAndConsent.complianceChecklist.map((item, index) => (
                                            <li key={index} className="text-slate-600">
                                                <span className="font-medium text-slate-800">{item.regulation} - {item.action}:</span> {item.plan}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* AI-Driven Deliverability */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <div className="flex items-center space-x-3 mb-3">
                                <DeliverabilityIcon className="w-5 h-5 text-purple-600" />
                                <h4 className="font-semibold text-base text-slate-800">AI-Driven Deliverability</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="bg-white p-3 rounded-lg text-center border border-slate-200 shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Predictive Spam Score</p>
                                    <p className="text-2xl font-bold text-purple-600 my-1">{aiDrivenDeliverability.predictiveSpamCheck.simulatedScore}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 mb-1">Recommendations:</p>
                                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                                        {aiDrivenDeliverability.predictiveSpamCheck.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                </div>
                                 <div className="pt-2 border-t border-slate-200">
                                    <p className="font-semibold text-slate-700">Strategy</p>
                                    <p className="text-xs text-slate-500">{aiDrivenDeliverability.senderReputationStrategy}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};