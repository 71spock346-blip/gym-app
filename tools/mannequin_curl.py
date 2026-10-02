"""Stay Strong — exercise animation prototype v2: muscular mannequin from metaballs.

Every muscle mass is a metaball ellipsoid (delts, pecs, lats, traps, biceps,
triceps, forearms, glutes, quads, calves…) that merges with its neighbours into
one smooth surface. Each group of elements is parented to a bone of a small
hand-built armature, so posing the bones moves the muscles with the limb and
the joints stay organic. The working muscle is a second metaball family with
a gold emissive material, sitting just proud of the body surface.

usage: python3 proto_curl2.py preview        -> 2 frames at 360 px
       python3 proto_curl2.py loop [a b]     -> 36 frames at 480 px (optionally frames a..b)
"""
import bpy, math, os, sys, time
from mathutils import Vector, Matrix

MODE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in ('preview', 'loop') else 'preview'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out2'); os.makedirs(OUT, exist_ok=True)
FRAMES, FPS = 36, 12
SIZE = 360 if MODE == 'preview' else 480

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.resolution_x = sc.render.resolution_y = SIZE
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, FRAMES
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = 40 if MODE == 'preview' else 56
sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'

def srgb(h):
    v = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in v)
BG, GOLD = srgb('14161a'), srgb('e0a92c')
GREY = tuple(map(float, os.environ['GREY'].split(','))) if 'GREY' in os.environ else (0.17, 0.17, 0.19)

def material(name, rgb, rough=0.5, metal=0.0, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*rgb, 1); b.inputs['Emission Strength'].default_value = emit
    return m
body_mat = material('body', GREY, 0.48)
gold_mat = material('muscle', GOLD, 0.4, emit=1.3)
iron_mat = material('iron', (0.05, 0.05, 0.06), 0.35, metal=0.7)

# ------------------------------------------------------------------ armature (world coords, standing, facing -Y)
BONES = {  # name: (head, tail, parent)
    'spine': ((0, 0, 0.95), (0, 0, 1.45), None),
    'neck': ((0, 0, 1.45), (0, 0, 1.62), 'spine'),
}
for s, sx in (('L', -1), ('R', 1)):
    BONES[f'upperarm{s}'] = ((sx * 0.285, 0.0, 1.49), (sx * 0.345, 0.03, 1.18), 'spine')
    BONES[f'forearm{s}'] = ((sx * 0.345, 0.03, 1.18), (sx * 0.37, -0.01, 0.93), f'upperarm{s}')
    BONES[f'hand{s}'] = ((sx * 0.37, -0.01, 0.93), (sx * 0.38, -0.03, 0.85), f'forearm{s}')
    BONES[f'thigh{s}'] = ((sx * 0.13, 0.0, 0.92), (sx * 0.14, 0.01, 0.50), 'spine')
    BONES[f'shin{s}'] = ((sx * 0.14, 0.01, 0.50), (sx * 0.145, 0.0, 0.09), f'thigh{s}')
    BONES[f'foot{s}'] = ((sx * 0.145, 0.0, 0.09), (sx * 0.145, -0.14, 0.03), f'shin{s}')

bpy.ops.object.armature_add(location=(0, 0, 0))
arm = bpy.context.object; arm.name = 'rig'
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
for b in list(eb): eb.remove(b)
for name, (h, t, p) in BONES.items():
    b = eb.new(name); b.head = Vector(h); b.tail = Vector(t)
for name, (h, t, p) in BONES.items():
    if p: eb[name].parent = eb[p]
bpy.ops.object.mode_set(mode='OBJECT')

def attach(obj, bone, world_matrix=None):
    """Parent obj to a bone, keeping its current world placement (or placing it)."""
    obj.parent = arm; obj.parent_type = 'BONE'; obj.parent_bone = bone
    obj.matrix_parent_inverse = Matrix.Identity(4)
    bpy.context.view_layer.update()
    obj.matrix_world = world_matrix or Matrix.Identity(4)

# ------------------------------------------------------------------ muscles as metaballs
# (bone, centre, semi-axes). Elements live in world coords because every metaball object sits at the origin.
def M(bone, x, y, z, rx, ry, rz): return (bone, (x, y, z), (rx, ry, rz))
BODY = [
    M('spine', 0, 0.0, 0.98, 0.165, 0.115, 0.11),      # pelvis
    M('spine', 0, 0.0, 1.12, 0.125, 0.095, 0.11),      # waist (narrow)
    M('spine', 0, -0.01, 1.26, 0.19, 0.115, 0.13),     # abs / lower chest
    M('spine', 0, 0.0, 1.40, 0.235, 0.12, 0.13),       # chest
    M('spine', 0, 0.01, 1.58, 0.065, 0.065, 0.11),     # neck
    M('neck', 0, 0.0, 1.78, 0.11, 0.12, 0.13),         # head
]
for s, sx in (('L', -1), ('R', 1)):
    BODY += [
        M('spine', sx * 0.10, -0.085, 1.375, 0.115, 0.07, 0.085),   # pec
        M('spine', sx * 0.185, 0.04, 1.28, 0.08, 0.11, 0.125),      # lat
        M('spine', sx * 0.11, 0.02, 1.52, 0.09, 0.07, 0.05),       # trap
        M(f'upperarm{s}', sx * 0.29, -0.01, 1.48, 0.11, 0.1, 0.1),        # deltoid
        M(f'upperarm{s}', sx * 0.33, -0.035, 1.33, 0.072, 0.072, 0.13),   # biceps
        M(f'upperarm{s}', sx * 0.335, 0.045, 1.32, 0.06, 0.06, 0.12),     # triceps
        M(f'forearm{s}', sx * 0.355, 0.0, 1.10, 0.064, 0.06, 0.1),        # forearm upper
        M(f'forearm{s}', sx * 0.365, -0.01, 0.98, 0.047, 0.045, 0.085),   # forearm lower
        M(f'hand{s}', sx * 0.38, -0.035, 0.885, 0.055, 0.05, 0.075),      # hand
        M(f'thigh{s}', sx * 0.135, 0.03, 0.90, 0.115, 0.115, 0.11),       # glute / hip
        M(f'thigh{s}', sx * 0.14, -0.02, 0.70, 0.098, 0.098, 0.17),       # quad
        M(f'thigh{s}', sx * 0.14, 0.0, 0.51, 0.07, 0.07, 0.08),           # knee
        M(f'shin{s}', sx * 0.145, 0.045, 0.36, 0.07, 0.08, 0.13),         # calf
        M(f'shin{s}', sx * 0.145, -0.01, 0.22, 0.048, 0.048, 0.12),       # shin
        M(f'foot{s}', sx * 0.145, -0.06, 0.045, 0.06, 0.13, 0.045),       # foot
    ]
GLOW = [M(f'upperarm{s}', sx * 0.33, -0.052, 1.33, 0.07, 0.068, 0.12) for s, sx in (('L', -1), ('R', 1))]  # biceps lit

ARM_BONES = {f'{b}{s}' for b in ('upperarm', 'forearm', 'hand') for s in 'LR'}

def build_family(prefix, elements, mat, res):
    """One metaball object per bone (same family name so they merge), elements in world coords."""
    by_bone = {}
    for bone, c, r in elements: by_bone.setdefault(bone, []).append((c, r))
    first = True
    for bone, els in by_bone.items():
        mb = bpy.data.metaballs.new(prefix); mb.resolution = res * 2; mb.render_resolution = res; mb.threshold = 1.0
        obj = bpy.data.objects.new(prefix if first else f'{prefix}.{len(by_bone):03d}', mb)
        sc.collection.objects.link(obj)
        if first: mb.materials.append(mat)
        for c, r in els:
            e = mb.elements.new(); e.type = 'ELLIPSOID'; e.co = c
            e.size_x, e.size_y, e.size_z = r; e.stiffness = 2.6
        attach(obj, bone)
        first = False
build_family('Body', [e for e in BODY if e[0] not in ARM_BONES or e[2][0] >= 0.1], body_mat, 0.018)
for s in 'LR':
    build_family(f'Arm{s}', [e for e in BODY if e[0] in ARM_BONES and e[0].endswith(s) and e[2][0] < 0.1], body_mat, 0.018)
build_family('Glow', GLOW, gold_mat, 0.018)
print('Body material:', bpy.data.objects['Body'].data.materials[0].name if bpy.data.objects['Body'].data.materials else None, '| family objects:', sum(1 for o in sc.objects if o.name.startswith('Body')))

# ------------------------------------------------------------------ dumbbells on the hand bones
def dumbbell(s):
    parts = []
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.27, vertices=24, rotation=(0, math.radians(90), 0))
    h = bpy.context.object; h.name = f'handle{s}'; h.data.materials.append(iron_mat); bpy.ops.object.shade_smooth(); parts.append(h)
    for e in (-0.115, 0.115):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=0.045, vertices=48, rotation=(0, math.radians(90), 0), location=(e, 0, 0))
        p = bpy.context.object; p.data.materials.append(iron_mat); bpy.ops.object.shade_smooth()
        bev = p.modifiers.new('bevel', 'BEVEL'); bev.width = 0.006; bev.segments = 3; parts.append(p)
    for p in parts: p.select_set(True)
    bpy.context.view_layer.objects.active = h; bpy.ops.object.join()
    db = bpy.context.object; db.name = f'dumbbell{s}'
    hx, hy, hz = BONES[f'hand{s}'][1]
    attach(db, f'hand{s}', Matrix.Translation((hx, hy - 0.02, hz + 0.04)) @ Matrix.Rotation(math.radians(90), 4, 'Y'))   # handle left-right, plates facing out
for s in 'LR': dumbbell(s)

# ------------------------------------------------------------------ animation: curl (elbow flexion 12° -> 135° -> 12°)
def local_rot(bone_name, axis, angle):
    bl = arm.data.bones[bone_name].matrix_local.to_3x3()
    return (bl.inverted() @ Matrix.Rotation(angle, 3, axis) @ bl).to_quaternion()
bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
for s in 'LR':
    pb = arm.pose.bones[f'forearm{s}']; pb.rotation_mode = 'QUATERNION'
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FRAMES
        flex = math.radians(12 + 123 * (0.5 - 0.5 * math.cos(2 * math.pi * t)))
        pb.rotation_quaternion = local_rot(pb.name, 'X', -flex)
        pb.keyframe_insert('rotation_quaternion', frame=f)
bpy.ops.object.mode_set(mode='OBJECT')

# ------------------------------------------------------------------ scene
bpy.ops.mesh.primitive_plane_add(size=80); floor = bpy.context.object; floor.is_shadow_catcher = True
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (*BG, 1)
def light(loc, energy, size, color=(1, 1, 1)):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object
    l.data.energy = energy; l.data.size = size; l.data.color = color
    t = bpy.data.objects.new('t', None); sc.collection.objects.link(t); t.location = (0, 0, 1.1)
    c = l.constraints.new('TRACK_TO'); c.target = t; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
light((2.6, -3.0, 3.2), 270, 2.6)
light((-3.0, -2.2, 1.6), 120, 4.0, (0.85, 0.9, 1.0))
light((0.6, 3.0, 2.6), 300, 2.0, (1.0, 0.85, 0.6))
bpy.ops.object.camera_add(location=(1.95, -3.45, 1.3)); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 62
t = bpy.data.objects.new('camtarget', None); sc.collection.objects.link(t); t.location = (0, 0, 0.97)
c = cam.constraints.new('TRACK_TO'); c.target = t; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'

# ------------------------------------------------------------------ render
t0 = time.time()
if MODE == 'preview':
    for f in (1, FRAMES // 2 + 1):
        sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'preview_{f:02d}.png'); bpy.ops.render.render(write_still=True)
else:
    if len(sys.argv) >= 4: sc.frame_start, sc.frame_end = int(sys.argv[2]), int(sys.argv[3])
    sc.render.filepath = os.path.join(OUT, 'curl_'); bpy.ops.render.render(animation=True)
print(f'{MODE} rendered in {time.time() - t0:.0f} s')
