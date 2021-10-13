import Command from './Command';
import AddUserCommand from './AddUserCommand';
import GetCommand from './GetCommand';
import PingCommand from './PingCommand';
import RegisterCommand from './RegisterCommand';
import UnregisterCommand from './UnregisterCommand';

class Commands {
    static commands: Command[] = [
        new AddUserCommand(),
        new GetCommand(),
        new PingCommand(),
        new RegisterCommand(),
        new UnregisterCommand(),
    ];
}

export default Commands.commands;
