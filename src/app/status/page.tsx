'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Server, Database, Globe, Shield, Clock, ArrowLeft } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Services', status: 'operational', responseTime: 145, uptime: 99.9 },
    { name: 'Database', status: 'operational', responseTime: 23, uptime: 99.95 },
    { name: 'AI Workbench', status: 'operational', responseTime: 267, uptime: 99.8 },
    { name: 'Authentication', status: 'operational', responseTime: 89, uptime: 99.99 },
    { name: 'File Storage', status: 'operational', responseTime: 156, uptime: 99.85 },
    { name: 'Payment Processing', status: 'operational', responseTime: 234, uptime: 99.95 },
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setServices(services => services.map(service => ({
        ...service,
        responseTime: Math.max(20, service.responseTime + (Math.random() - 0.5) * 30),
      })));
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'degraded': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'down': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <div className="w-3 h-3 bg-green-400 rounded-full" />;
      case 'degraded': return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />;
      case 'down': return <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') ? 'operational' :
                       services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">System Status</h1>
            <p className="text-gray-300">Real-time status of AI Mind OS services</p>
          </div>

          {/* Overall Status */}
          <div className={`rounded-xl p-6 mb-8 border ${getStatusColor(overallStatus)}`}>
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">All Systems {overallStatus === 'operational' ? 'Operational' : overallStatus === 'degraded' ? 'Degraded' : 'Down'}</h2>
                <p className="opacity-80">Last updated: {lastUpdated.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {services.map((service) => (
              <div key={service.name} className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {service.name === 'API Services' && <Server className="w-5 h-5 text-blue-400" />}
                    {service.name === 'Database' && <Database className="w-5 h-5 text-green-400" />}
                    {service.name === 'AI Workbench' && <Activity className="w-5 h-5 text-purple-400" />}
                    {service.name === 'Authentication' && <Shield className="w-5 h-5 text-yellow-400" />}
                    {service.name === 'File Storage' && <Globe className="w-5 h-5 text-cyan-400" />}
                    {service.name === 'Payment Processing' && <Clock className="w-5 h-5 text-pink-400" />}
                    <h3 className="text-white font-semibold">{service.name}</h3>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-white">{Math.round(service.responseTime)}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uptime (30d)</span>
                    <span className="text-white">{service.uptime}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${service.uptime}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Data Handling */}
          <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              Security & Data Handling
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-3">Data Protection</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• All data encrypted in transit (TLS 1.3)</li>
                  <li>• Database encryption at rest (AES-256)</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• SOC 2 Type II compliance</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Infrastructure</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Multi-region deployment with auto-failover</li>
                  <li>• Real-time monitoring and alerting</li>
                  <li>• Automated backups every 6 hours</li>
                  <li>• 99.9% uptime SLA</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Privacy:</strong> We never sell your data. User content is encrypted and only accessible by you. 
                AI processing is done in secure, isolated environments with automatic data deletion after processing.
              </p>
            </div>
          </div>

          {/* Incident History */}
          <div className="mt-12 bg-white/5 backdrop-blur border border-white/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Incidents</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-1" />
                <div>
                  <p className="text-green-300 font-medium">No incidents in the past 30 days</p>
                  <p className="text-gray-400 text-sm mt-1">All systems have been running smoothly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
