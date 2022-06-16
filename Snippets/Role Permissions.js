//Role permissions might be a bit confusing at first
//To add or remove a permission you use the .remove or .add but not by itself
//We do:
//To remove a permission
await role.setPermissions(role.permissions.remove(Permissions.FLAGS.<Permission>));
//To add a permission
await role.setPermissions(role.permissions.add(Permissions.FLAGS.<Permission>));                          
