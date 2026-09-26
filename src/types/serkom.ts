export interface ExamCandidate {
  name: string;
  school: string;
}

export interface NetworkConfig {
  // WAN / Internet
  wanIp: string;
  wanGateway: string;
  dnsServer: string;
  ntpEnabled: boolean;
  ntpServer: string;

  // Web Proxy
  webProxyEnabled: boolean;
  webProxyPort: string;
  cacheAdministrator: string;

  // LAN (ether2)
  lanIp: string; // 192.168.100.1/25
  lanDhcpPoolStart: string; // 192.168.100.2
  lanDhcpPoolEnd: string; // 192.168.100.100 (99 clients)
  lanDhcpEnabled: boolean;

  // Wireless (wlan1)
  wlanIp: string; // 192.168.200.1/24
  ssid: string; // [nama]@ProxyUKK
  wlanDhcpPoolStart: string; // 192.168.200.2
  wlanDhcpPoolEnd: string; // 192.168.200.100 (99 clients)
  wlanDhcpEnabled: boolean;

  // Firewall Rules
  firewallDropPingRouter: boolean; // 192.168.100.2-192.168.100.50 drop to router
  firewallPingRouterChain: string;
  firewallPingRouterSrc: string;
  firewallPingRouterProto: string;
  firewallPingRouterAction: string;

  firewallDropPingWireless: boolean; // 192.168.100.51-192.168.100.100 drop to wireless
  firewallPingWlanChain: string;
  firewallPingWlanSrc: string;
  firewallPingWlanDst: string;
  firewallPingWlanProto: string;
  firewallPingWlanAction: string;

  loggingToDisk: boolean; // log access to router & save to disk
  loggingTopic: string;
  loggingAction: string;
  loggingPrefix: string;

  hotspotTimeRestriction: boolean; // internet only 07.00 - 16.00
  hotspotTimeStart: string;
  hotspotTimeEnd: string;
  hotspotTimeAction: string;

  blockWebsite: boolean; // block http://www.example.com/
  blockWebsiteUrl: string;
  blockWebsiteAction: string;
  blockWebsiteRedirectPort: string;
  natMasquerade: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  spec: string;
  category: 'required' | 'distractor';
  selected: boolean;
  iconName: string;
}

export interface WireColor {
  id: number;
  colorName: string;
  hex: string;
  borderHex?: string;
  striped?: boolean;
}

export interface EvaluationItem {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
  points: number;
  completed: boolean;
  feedback: string;
}

export interface LogEntry {
  id: string;
  time: string;
  topic: string;
  message: string;
  type: 'info' | 'firewall' | 'dhcp' | 'hotspot' | 'proxy';
}
