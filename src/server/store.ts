import type {
  Device,
  Organization,
  ProcessedSyncEvent,
  Property,
  UserProfile,
} from "@starter/contracts";

export type StoredAuditEntry = {
  id: string;
  organizationId: string;
  kind: string;
  payload: Record<string, unknown>;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export class InMemoryStore {
  private organizations = new Map<string, Organization>();
  private users = new Map<string, UserProfile>();
  private devices = new Map<string, Device>();
  private syncEvents = new Map<string, ProcessedSyncEvent>();
  private auditEntries: StoredAuditEntry[] = [];

  constructor() {
    this.seed();
  }

  public reset(): void {
    this.organizations.clear();
    this.users.clear();
    this.devices.clear();
    this.syncEvents.clear();
    this.auditEntries = [];
    this.seed();
  }

  private seed(): void {
    // Tenants
    this.organizations.set("org-demo-001", {
      id: "org-demo-001",
      name: "Demo Organization Alpha",
      slug: "demo-alpha",
      createdAt: new Date().toISOString(),
    });

    this.organizations.set("org-demo-002", {
      id: "org-demo-002",
      name: "Demo Organization Beta",
      slug: "demo-beta",
      createdAt: new Date().toISOString(),
    });

    // Users
    this.users.set("user-demo-001", {
      id: "user-demo-001",
      organizationId: "org-demo-001",
      email: "admin@alpha.demo",
      displayName: "Alpha Admin",
      role: "admin_global",
      createdAt: new Date().toISOString(),
    });

    // Initial Devices
    this.devices.set("device-001", {
      id: "device-001",
      organizationId: "org-demo-001",
      deviceFingerprint: "fp-phone-001",
      assignedUserId: "user-demo-001",
      status: "active",
      createdAt: new Date().toISOString(),
    });

    this.devices.set("device-demo-001", {
      id: "device-demo-001",
      organizationId: "org-demo-001",
      deviceFingerprint: "fp-demo-001",
      assignedUserId: "user-demo-001",
      status: "active",
      createdAt: new Date().toISOString(),
    });
  }

  // Organizations
  public getOrganization(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  public listOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  // Devices
  public getDevice(id: string): Device | undefined {
    return this.devices.get(id);
  }

  public getDeviceByFingerprint(orgId: string, fingerprint: string): Device | undefined {
    return Array.from(this.devices.values()).find(
      (d) => d.organizationId === orgId && d.deviceFingerprint === fingerprint
    );
  }

  public listDevices(orgId: string): Device[] {
    return Array.from(this.devices.values()).filter((d) => d.organizationId === orgId);
  }

  public registerDevice(device: Device): void {
    this.devices.set(device.id, device);
  }

  public updateDevice(id: string, partial: Partial<Device>): Device | undefined {
    const existing = this.devices.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partial };
    this.devices.set(id, updated);
    return updated;
  }

  // Sync Events
  public getSyncEvent(clientEventId: string): ProcessedSyncEvent | undefined {
    return this.syncEvents.get(clientEventId);
  }

  public listSyncEvents(orgId: string): ProcessedSyncEvent[] {
    return Array.from(this.syncEvents.values());
  }

  public recordSyncEvent(event: ProcessedSyncEvent): void {
    this.syncEvents.set(event.clientEventId, event);
  }

  // Properties (CIP)
  private properties = new Map<string, Property>();

  // Audit
  public recordAudit(entry: StoredAuditEntry): void {
    this.auditEntries.push(entry);
  }

  public listAuditEntries(orgId: string): StoredAuditEntry[] {
    return this.auditEntries.filter((a) => a.organizationId === orgId);
  }

  // Properties CRUD
  public saveProperty(property: Property): void {
    this.properties.set(property.id, property);
  }

  public getProperty(id: string): Property | undefined {
    return this.properties.get(id);
  }

  public listProperties(orgId?: string): Property[] {
    const all = Array.from(this.properties.values());
    if (!orgId) return all;
    return all.filter((p) => p.organizationId === orgId);
  }
}

let storeInstance: InMemoryStore | null = null;

export function getStore(): InMemoryStore {
  if (!storeInstance) {
    storeInstance = new InMemoryStore();
  }
  return storeInstance;
}
