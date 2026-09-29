"""CEN207 test runner: unit tests and program checks for every week under code/week-NN.

For each week folder (or only the weeks given with --week):
  1. every program compiles warning-free (gcc -std=c11 -Wall -Wextra -Werror, javac -Xlint:all -Werror)
     and runs to completion; the C and Java versions of a program print the same output;
  2. unit tests: tests/c/test_<program>.c and tests/java/<Program>Test.java are compiled and run;
     a test exits with status 0 only when every check passed;
  3. with --sanitize (needs WSL with gcc): every C program and C test is rebuilt with
     -fsanitize=address,undefined and run again, so memory errors, leaks and undefined behaviour fail.

Everything is built in a temporary folder outside the repository (the repository may live on a synced
drive), so the repository itself is never written to.

Usage (from the repository root):  py -3.12 code/run_tests.py [--week 1 --week 2 ...] [--sanitize] [-v]
Exit status 1 when anything failed.

C unit-test convention (code/week-NN/tests/c/test_<program>.c): include the program with main() renamed:
    #define main program_main
    #include "../../c/linear_search.c"
    #undef main
    #include "../../../test_check.h"      // CHECK(cond), CHECK_EQ_INT(actual, expected), TEST_SUMMARY()
Java unit-test convention (code/week-NN/tests/java/<Program>Test.java): call the program's static methods
and finish with System.exit(failures == 0 ? 0 : 1).
"""
import argparse
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
TIMEOUT = 60


def run(cmd, cwd=None, timeout=TIMEOUT):
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, timeout=timeout, stdin=subprocess.DEVNULL)
        return p.returncode, (p.stdout + p.stderr).decode('utf-8', 'replace').replace('\r\n', '\n')
    except subprocess.TimeoutExpired:
        return 124, 'TIMEOUT'
    except FileNotFoundError as e:
        return 127, str(e)


def wsl_path(p):
    p = str(p).replace('\\', '/')
    return '/mnt/' + p[0].lower() + p[2:]


class Report:
    def __init__(self, verbose):
        self.fail, self.ok, self.verbose = [], 0, verbose

    def check(self, good, label, detail=''):
        if good:
            self.ok += 1
            if self.verbose:
                print('  ok   ', label)
        else:
            self.fail.append(label)
            print('  FAIL ', label)
            if detail:
                print('       ' + detail.strip().replace('\n', '\n       ')[:1500])


def first_difference(a, b):
    for x, y in zip(a.split('\n'), b.split('\n')):
        if x != y:
            return f'C:    {x}\nJava: {y}'
    return '(one output is longer than the other)'


def test_week(week_dir, tmp, rep, sanitize):
    work = tmp / week_dir.name
    for sub in ('c', 'java', 'tests'):
        if (week_dir / sub).exists():
            shutil.copytree(week_dir / sub, work / sub, dirs_exist_ok=True,
                            ignore=shutil.ignore_patterns('desktop.ini', '*.exe', '*.class'))
    c_srcs = sorted((work / 'c').glob('*.c')) if (work / 'c').exists() else []
    c_tests = sorted((work / 'tests' / 'c').glob('test_*.c')) if (work / 'tests' / 'c').exists() else []
    j_srcs = sorted((work / 'java').glob('*.java')) if (work / 'java').exists() else []
    j_tests = sorted((work / 'tests' / 'java').glob('*.java')) if (work / 'tests' / 'java').exists() else []

    c_out = {}
    for src in c_srcs:
        exe = work / (src.stem + '.exe')
        rc, out = run(['gcc', '-std=c11', '-Wall', '-Wextra', '-Werror', '-o', str(exe), str(src), '-lm'])
        rep.check(rc == 0, f'{week_dir.name} compile c/{src.name}', out)
        if rc == 0:
            rc, out = run([str(exe)], cwd=work)
            rep.check(rc == 0, f'{week_dir.name} run c/{src.name}', out[-800:])
            c_out[src.stem.replace('_', '').lower()] = out
    if j_srcs:
        classes = work / 'classes'
        rc, out = run(['javac', '-Xlint:all', '-Werror', '-encoding', 'UTF-8', '-d', str(classes)]
                      + [str(s) for s in j_srcs + j_tests], timeout=300)
        rep.check(rc == 0, f'{week_dir.name} compile java ({len(j_srcs)} programs, {len(j_tests)} tests)', out)
        if rc == 0:
            for s in j_srcs:
                rc, out = run(['java', '-cp', str(classes), s.stem], cwd=work)
                rep.check(rc == 0, f'{week_dir.name} run java/{s.name}', out[-800:])
                key = s.stem.lower()
                if key in c_out:
                    rep.check(out == c_out[key], f'{week_dir.name} C output == Java output: {s.stem}',
                              first_difference(c_out[key], out))
            for t in j_tests:
                rc, out = run(['java', '-ea', '-cp', str(classes), t.stem], cwd=work)
                rep.check(rc == 0, f'{week_dir.name} unit java/{t.name}', out[-1500:])
    for t in c_tests:
        exe = work / (t.stem + '.exe')
        rc, out = run(['gcc', '-std=c11', '-Wall', '-Wextra', '-Werror', '-o', str(exe), t.name, '-lm'], cwd=t.parent)
        rep.check(rc == 0, f'{week_dir.name} compile tests/c/{t.name}', out)
        if rc == 0:
            rc, out = run([str(exe)], cwd=t.parent)
            rep.check(rc == 0, f'{week_dir.name} unit c/{t.name}', out[-1500:])
    if sanitize:
        flags = ('-std=c11 -Wall -Wextra -g -O1 -fno-omit-frame-pointer '
                 '-fsanitize=address,undefined -fno-sanitize-recover=all')
        env = 'ASAN_OPTIONS=detect_leaks=1 UBSAN_OPTIONS=print_stacktrace=1'
        # setarch -R: gcc 9's ASan crashes at random (DEADLYSIGNAL) under high-entropy ASLR, so run without ASLR
        # one WSL start per week (starting WSL per file was slow enough to hit timeouts); each file prints a
        # result line "SAN <where>/<name> <status>" and its sanitizer report goes to <name>.asan.log
        items = [(s, 'c') for s in c_srcs] + [(t, 'tests/c') for t in c_tests]
        script = ''.join(
            f'cd "{wsl_path(src.parent)}"; if gcc {flags} -o "{src.stem}.asan" "{src.name}" -lm > "{src.stem}.asan.log" 2>&1; '
            f'then {env} timeout 120 setarch "$(uname -m)" -R ./"{src.stem}.asan" > /dev/null 2>> "{src.stem}.asan.log"; '
            f'echo "SAN {where}/{src.name} $?"; else echo "SAN {where}/{src.name} compile-failed"; fi\n'
            for src, where in items)
        (work / 'sanitize.sh').write_text(script, encoding='utf-8', newline='\n')
        rc, out = run(['wsl', '-e', 'sh', wsl_path(work / 'sanitize.sh')], cwd=work,   # cwd on C:, not on G:
                       timeout=120 * len(items) + 300)
        status = {line.split()[1]: line.split()[2] for line in out.split('\n') if line.startswith('SAN ')}
        for src, where in items:
            st = status.get(f'{where}/{src.name}', 'no-result')
            log = src.parent / f'{src.stem}.asan.log'
            detail = log.read_text(encoding='utf-8', errors='replace')[-1500:] if log.exists() else out[-800:]
            rep.check(st == '0', f'{week_dir.name} sanitize {where}/{src.name} ({st})', detail)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--week', type=int, action='append')
    ap.add_argument('--sanitize', action='store_true')
    ap.add_argument('-v', '--verbose', action='store_true')
    a = ap.parse_args()
    weeks = sorted(p for p in ROOT.glob('week-[0-9][0-9]') if p.is_dir())
    if a.week:
        weeks = [w for w in weeks if int(w.name[-2:]) in a.week]
    rep = Report(a.verbose)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='cen207-tests-'))
    shutil.copy(ROOT / 'test_check.h', tmp / 'test_check.h')   # tests include "../../../test_check.h"
    try:
        for w in weeks:
            print(f'== {w.name}')
            test_week(w, tmp, rep, a.sanitize)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f'\n{rep.ok} passed, {len(rep.fail)} failed')
    sys.exit(1 if rep.fail else 0)


if __name__ == '__main__':
    main()
