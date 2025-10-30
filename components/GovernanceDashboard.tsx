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
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600/50">
            <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-200" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-white">Governance & Compliance Plan</h3>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Frequency Management */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <FrequencyIcon className="w-5 h-5 text-blue-400" />
                                <h4 className="font-medium text-base text-gray-100">Frequency Management</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-300">Global Cap: {frequencyManagement.globalCaps.messagesPerWeek} msg/week</p>
                                    <p className="text-xs text-gray-400">{frequencyManagement.globalCaps.rationale}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-300">Channel Caps:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-400 pl-1">
                                        {frequencyManagement.channelSpecificCaps.map(c => <li key={c.channel}>{c.channel}: {c.limit}</li>)}
                                    </ul>
                                </div>
                                <div className="pt-2 border-t border-gray-700/50">
                                    <p className="font-semibold text-gray-300">Intelligent Suppression</p>
                                    <p className="text-xs text-gray-400">{frequencyManagement.intelligentSuppression.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Compliance & Consent */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                             <div className="flex items-center space-x-3 mb-3">
                                <ComplianceIcon className="w-5 h-5 text-green-400" />
                                <h4 className="font-medium text-base text-gray-100">Compliance & Consent</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-300">Primary Regulations:</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                    {complianceAndConsent.primaryRegulations.map(r => (
                                        <span key={r} className="text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded-md">{r}</span>
                                    ))}
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-700/50">
                                    <p className="font-semibold text-gray-300 mb-1">Data Rights Plan:</p>
                                    <ul className="space-y-2 text-xs">
                                        {complianceAndConsent.complianceChecklist.map((item, index) => (
                                            <li key={index} className="text-gray-400">
                                                <span className="font-medium text-gray-300">{item.regulation} - {item.action}:</span> {item.plan}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* AI-Driven Deliverability */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <DeliverabilityIcon className="w-5 h-5 text-purple-400" />
                                <h4 className="font-medium text-base text-gray-100">AI-Driven Deliverability</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="bg-gray-900/70 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-400">Predictive Spam Score</p>
                                    <p className="text-2xl font-bold text-purple-300 my-1">{aiDrivenDeliverability.predictiveSpamCheck.simulatedScore}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-300 mb-1">Recommendations:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                                        {aiDrivenDeliverability.predictiveSpamCheck.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                </div>
                                 <div className="pt-2 border-t border-gray-700/50">
                                    <p className="font-semibold text-gray-300">Strategy</p>
                                    <p className="text-xs text-gray-400">{aiDrivenDeliverability.senderReputationStrategy}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
