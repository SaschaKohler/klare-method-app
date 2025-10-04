import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("../../services/ResourceLibraryService", () => {
  const actual = jest.requireActual("../../services/ResourceLibraryService") as typeof import("../../services/ResourceLibraryService");
  return {
    __esModule: true,
    ...actual,
    default: {
      ...actual.default,
      getUserResources: jest.fn(),
      addResource: jest.fn(),
      updateResource: jest.fn(),
      deleteResource: jest.fn(),
      activateResource: jest.fn(),
    },
  };
});

import ResourceLibraryService, {
  ResourceCategory,
  type Resource,
} from "../../services/ResourceLibraryService";
import { useResourceStore } from "../useResourceStore";

const resourceServiceMock = jest.mocked(ResourceLibraryService);

const createResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: overrides.id ?? "resource-1",
  userId: overrides.userId ?? "user-1",
  name: overrides.name ?? "Atemübung",
  description: overrides.description ?? "Kurze Atemtechnik",
  rating: overrides.rating ?? 4,
  category: overrides.category ?? ResourceCategory.ACTIVITY,
  activationTips: overrides.activationTips ?? "Tief ein- und ausatmen",
  lastActivated: overrides.lastActivated,
  createdAt: overrides.createdAt ?? "2025-01-01T00:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2025-01-01T00:00:00.000Z",
});

const resetResourceStore = () => {
  useResourceStore.setState((state) => ({
    ...state,
    resources: [],
    currentUserResources: [],
    metadata: {
      ...state.metadata,
      isLoading: false,
      error: null,
    },
  }));
};

describe("useResourceStore", () => {
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    resetResourceStore();
  });

  test("lädt Ressourcen und setzt Status", async () => {
    const resources = [createResource(), createResource({ id: "resource-2" })];
    resourceServiceMock.getUserResources.mockResolvedValue(resources);

    await useResourceStore.getState().loadResources(userId);

    const state = useResourceStore.getState();
    expect(resourceServiceMock.getUserResources).toHaveBeenCalledWith(userId);
    expect(state.resources).toEqual(resources);
    expect(state.currentUserResources).toEqual(resources);
    expect(state.metadata.isLoading).toBe(false);
    expect(state.metadata.error).toBeNull();
  });

  test("addResource fügt neue Ressource hinzu", async () => {
    const newResource = createResource({ id: "resource-new", name: "Eisbad" });
    resourceServiceMock.addResource.mockResolvedValue(newResource);

    const result = await useResourceStore
      .getState()
      .addResource(userId, {
        name: newResource.name,
        description: newResource.description,
        rating: newResource.rating,
        category: newResource.category,
        activationTips: newResource.activationTips,
        lastActivated: newResource.lastActivated,
      });

    expect(result).toEqual(newResource);
    expect(useResourceStore.getState().resources).toContainEqual(newResource);
  });

  test("updateResource aktualisiert bestehende Ressource", async () => {
    const existing = createResource();
    const updated = { ...existing, name: "Aktive Meditation" };

    useResourceStore.setState((state) => ({
      ...state,
      resources: [existing],
      currentUserResources: [existing],
    }));

    resourceServiceMock.updateResource.mockResolvedValue(updated);

    await useResourceStore.getState().updateResource(userId, existing.id, {
      name: updated.name,
    });

    const state = useResourceStore.getState();
    expect(resourceServiceMock.updateResource).toHaveBeenCalledWith(
      userId,
      existing.id,
      { name: updated.name },
    );
    expect(state.resources[0].name).toBe(updated.name);
    expect(state.currentUserResources[0].name).toBe(updated.name);
  });

  test("deleteResource entfernt Ressource aus den Listen", async () => {
    const resource = createResource({ id: "resource-delete" });
    useResourceStore.setState((state) => ({
      ...state,
      resources: [resource],
      currentUserResources: [resource],
    }));

    resourceServiceMock.deleteResource.mockResolvedValue(undefined);

    await useResourceStore.getState().deleteResource(userId, resource.id);

    const state = useResourceStore.getState();
    expect(resourceServiceMock.deleteResource).toHaveBeenCalledWith(userId, resource.id);
    expect(state.resources).toHaveLength(0);
    expect(state.currentUserResources).toHaveLength(0);
  });

  test("getResourcesByCategory filtert nach Kategorie", () => {
    const activity = createResource({ id: "resource-activity", category: ResourceCategory.ACTIVITY });
    const personal = createResource({
      id: "resource-strength",
      category: ResourceCategory.PERSONAL_STRENGTH,
      name: "Selbstreflexion",
    });

    useResourceStore.setState((state) => ({
      ...state,
      currentUserResources: [activity, personal],
    }));

    const result = useResourceStore.getState().getResourcesByCategory(ResourceCategory.PERSONAL_STRENGTH);
    expect(result).toEqual([personal]);
  });

  test("searchResources durchsucht Namen und Beschreibungen", () => {
    const items = [
      createResource({ id: "resource-focus", name: "Fokusübung", description: "Fokus" }),
      createResource({ id: "resource-lach", name: "Lachyoga", description: "Lachen" }),
    ];

    useResourceStore.setState((state) => ({
      ...state,
      currentUserResources: items,
    }));

    const result = useResourceStore.getState().searchResources("lach");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("resource-lach");
  });
});
