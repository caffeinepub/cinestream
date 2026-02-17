import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";



actor {
  let storage = Storage.new();
  include MixinStorage(storage);

  var trendingMovies = Map.empty<Text, Text>();
  var trendingTVShows = Map.empty<Text, Text>();

  // User-specific tracked shows and last visit timestamp
  var userTrackedShows = Map.empty<Principal, [Text]>();
  var userLastVisit = Map.empty<Principal, Time.Time>();

  // User profiles
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Access control state
  var accessControlState = AccessControl.initState();

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // Helper function to ensure user is initialized
  private func ensureUserInitialized(caller : Principal) {
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    // If user is a guest (not initialized), initialize them as a user
    switch (currentRole) {
      case (#guest) {
        AccessControl.initialize(accessControlState, caller);
      };
      case (_) {
        // User is already initialized (either as #user or #admin)
      };
    };
  };

  // Initialize access control (first caller becomes admin, subsequent callers become users)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  // Get caller's user role
  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  // Assign user role (admin only)
  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Check if caller is admin
  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get user profile (caller must be the user or admin)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Ensure user is initialized before checking permissions
    ensureUserInitialized(caller);

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get trending movies (public access - no authentication required)
  public query func getTrendingMovies() : async [(Text, Text)] {
    trendingMovies.toArray();
  };

  // Get trending TV shows (public access - no authentication required)
  public query func getTrendingTVShows() : async [(Text, Text)] {
    trendingTVShows.toArray();
  };

  // Update trending movies (admin only)
  public shared ({ caller }) func updateTrendingMovies(_movies : [(Text, Text)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update trending movies");
    };

    trendingMovies := Map.fromIter(_movies.values());
  };

  // Update trending TV shows (admin only)
  public shared ({ caller }) func updateTrendingTVShows(_tvShows : [(Text, Text)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update trending TV shows");
    };

    trendingTVShows := Map.fromIter(_tvShows.values());
  };

  // Get user's tracked shows (user only)
  public query ({ caller }) func getTrackedShows() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tracked shows");
    };
    switch (userTrackedShows.get(caller)) {
      case (?shows) { shows };
      case (null) { [] };
    };
  };

  // Add show to user's tracked list (user only)
  public shared ({ caller }) func addTrackedShow(showId : Text) : async () {
    // Ensure user is initialized before checking permissions
    ensureUserInitialized(caller);

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tracked shows");
    };

    let currentShows = switch (userTrackedShows.get(caller)) {
      case (?shows) { shows };
      case (null) { [] };
    };

    // Check if the show is already tracked
    let alreadyTracked = currentShows.find(func(id : Text) : Bool {
      id == showId;
    });

    // Add the new show if it's not already tracked
    switch (alreadyTracked) {
      case (?_) { return }; // Show already tracked, no need to add again
      case (null) {
        let updatedShows = currentShows.concat([showId]);
        userTrackedShows.add(caller, updatedShows);
      };
    };
  };

  // Remove show from user's tracked list (user only)
  public shared ({ caller }) func removeTrackedShow(showId : Text) : async () {
    // Ensure user is initialized before checking permissions
    ensureUserInitialized(caller);

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove tracked shows");
    };
    let currentShows = switch (userTrackedShows.get(caller)) {
      case (?shows) { shows };
      case (null) { [] };
    };
    let updatedShows = currentShows.filter(func(id : Text) : Bool { id != showId });
    userTrackedShows.add(caller, updatedShows);
  };

  // Update user's last visit timestamp (user only)
  public shared ({ caller }) func updateLastVisit() : async () {
    // Ensure user is initialized before checking permissions
    ensureUserInitialized(caller);

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update last visit");
    };
    userLastVisit.add(caller, Time.now());
  };

  // Get user's last visit timestamp (user only)
  public query ({ caller }) func getLastVisit() : async ?Time.Time {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access last visit");
    };
    userLastVisit.get(caller);
  };
};

