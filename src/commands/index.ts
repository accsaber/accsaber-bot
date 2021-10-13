import Command from './Command';
import AddUserCommand from './AddUserCommand';
import CreateRRCommand from './CreateRRCommand';
import GetCommand from './GetCommand';
import PingCommand from './PingCommand';
import RegisterCommand from './RegisterCommand';
import RemoveRRCommand from './RemoveRRCommand';
import RemoveUserCommand from './RemoveUserCommand';
import UnregisterCommand from './UnregisterCommand';

class Commands {
    static commands: Command[] = [
        new AddUserCommand(),
        new CreateRRCommand(),
        new GetCommand(),
        new PingCommand(),
        new RegisterCommand(),
        new RemoveRRCommand(),
        new RemoveUserCommand(),
        new UnregisterCommand(),
    ];
}

export default Commands.commands;
